const pool = require("../config/db");
const uploadImage = require("../utils/uploadImage");

function lerVariantes(body) {
  if (body.variantes === undefined) return undefined;

  const variantes = typeof body.variantes === "string"
    ? JSON.parse(body.variantes)
    : body.variantes;

  if (!Array.isArray(variantes)) {
    throw new Error("variantes precisa ser uma lista");
  }

  return variantes.map((variante) => {
    const estoque = Number(variante.estoque);
    if (!Number.isInteger(estoque) || estoque < 0) {
      throw new Error("estoque das variantes precisa ser um número inteiro maior ou igual a zero");
    }
    return {
      id: variante.id ? Number(variante.id) : null,
      tamanho: variante.tamanho || null,
      cor: variante.cor || null,
      estoque
    };
  });
}

async function salvarVariantes(client, produtoId, variantes) {
  for (const variante of variantes) {
    if (variante.id) {
      const { rowCount } = await client.query(
        `UPDATE variacoes_produto
         SET tamanho = $1, cor = $2, estoque = $3
         WHERE id = $4 AND produto_id = $5`,
        [variante.tamanho, variante.cor, variante.estoque, variante.id, produtoId]
      );
      if (rowCount === 0) throw new Error("Variação não pertence a este produto");
    } else {
      await client.query(
        `INSERT INTO variacoes_produto (produto_id, tamanho, cor, estoque)
         VALUES ($1, $2, $3, $4)`,
        [produtoId, variante.tamanho, variante.cor, variante.estoque]
      );
    }
  }
}

const ORDENACOES = {
  recentes: "p.created_at DESC",
  preco_asc: "p.preco ASC",
  preco_desc: "p.preco DESC",
  nome_asc: "p.nome ASC"
};

exports.getProducts = async (req, res) => {
  try {
    const { busca, categoria_id, marca_id, estilo_id, preco_min, preco_max, ordenar, page, limit } = req.query;
    const condicoes = ["p.ativo = TRUE"];
    const valores = [];

    if (busca && busca.trim()) {
      valores.push(`%${busca.trim()}%`);
      condicoes.push(`(p.nome ILIKE $${valores.length} OR p.descricao ILIKE $${valores.length})`);
    }
    if (categoria_id) { valores.push(categoria_id); condicoes.push(`p.categoria_id = $${valores.length}`); }
    if (marca_id)     { valores.push(marca_id);     condicoes.push(`p.marca_id = $${valores.length}`); }
    if (preco_min)    { valores.push(preco_min);    condicoes.push(`p.preco >= $${valores.length}`); }
    if (preco_max)    { valores.push(preco_max);    condicoes.push(`p.preco <= $${valores.length}`); }

    if (estilo_id) {
      valores.push(estilo_id);
      condicoes.push(`EXISTS (SELECT 1 FROM produto_estilos pe WHERE pe.produto_id = p.id AND pe.estilo_id = $${valores.length})`);
    }

    const ordem = ORDENACOES[ordenar] || ORDENACOES.recentes;
    const paginaAtual = Math.max(parseInt(page, 10) || 1, 1);
    const porPagina   = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset      = (paginaAtual - 1) * porPagina;

    valores.push(porPagina);
    const paramLimit = valores.length;
    valores.push(offset);
    const paramOffset = valores.length;

    const query = `
      SELECT p.*,
             c.nome AS categoria_nome,
             m.nome AS marca_nome,
             COALESCE(
               json_agg(DISTINCT jsonb_build_object('id', e.id, 'nome', e.nome))
               FILTER (WHERE e.id IS NOT NULL),
               '[]'
             ) AS estilos
      FROM produtos p
      LEFT JOIN categorias c ON c.id = p.categoria_id
      LEFT JOIN marcas m ON m.id = p.marca_id
      LEFT JOIN produto_estilos pe ON pe.produto_id = p.id
      LEFT JOIN estilos e ON e.id = pe.estilo_id
      WHERE ${condicoes.join(" AND ")}
      GROUP BY p.id, c.nome, m.nome
      ORDER BY ${ordem}
      LIMIT $${paramLimit}
      OFFSET $${paramOffset}
    `;

    const { rows: produtos } = await pool.query(query, valores);
    return res.json({ produtos, pagina: paginaAtual, por_pagina: porPagina });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*,
              COALESCE(
                json_agg(DISTINCT jsonb_build_object('id', e.id, 'nome', e.nome))
                FILTER (WHERE e.id IS NOT NULL),
                '[]'
              ) AS estilos
       FROM produtos p
       LEFT JOIN produto_estilos pe ON pe.produto_id = p.id
       LEFT JOIN estilos e ON e.id = pe.estilo_id
       WHERE p.id = $1
       GROUP BY p.id`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Produto não encontrado" });
    return res.json(rows[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  }
};

exports.createProduct = async (req, res) => {
  const client = await pool.connect();
  try {
    const { nome, descricao, preco, categoria_id, marca_id } = req.body;
    let estilo_ids = req.body['estilo_ids[]'] || req.body.estilo_ids || [];
    if (!Array.isArray(estilo_ids)) estilo_ids = [estilo_ids];
    let variantes;
    try {
      variantes = lerVariantes(req.body);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    if (!nome || !nome.trim() || !preco || preco <= 0) {
      return res.status(400).json({ message: "nome e preco (> 0) são obrigatórios" });
    }
    if (!req.file) return res.status(400).json({ message: "Imagem é obrigatória" });

    const imagem_url = await uploadImage(req.file.buffer, "produtos");

    await client.query("BEGIN");

    const { rows: [produto] } = await client.query(
      `INSERT INTO produtos (nome, descricao, preco, imagem_url, categoria_id, marca_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [nome, descricao, preco, imagem_url, categoria_id || null, marca_id || null]
    );

    for (const estiloId of estilo_ids) {
      await client.query(
        "INSERT INTO produto_estilos (produto_id, estilo_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
        [produto.id, Number(estiloId)]
      );
    }

    if (variantes) await salvarVariantes(client, produto.id, variantes);

    await client.query("COMMIT");
    return res.status(201).json({ message: "Produto criado", id: produto.id });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  } finally {
    client.release();
  }
};

exports.updateProduct = async (req, res) => {
  const client = await pool.connect();
  try {
    const { nome, descricao, preco, categoria_id, marca_id, ativo } = req.body;
    let estilo_ids = req.body['estilo_ids[]'] || req.body.estilo_ids;
    let variantes;
    try {
      variantes = lerVariantes(req.body);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    let imagem_url = null;
    if (req.file) imagem_url = await uploadImage(req.file.buffer, "produtos");

    await client.query("BEGIN");

    const { rowCount } = await client.query(
      `UPDATE produtos SET
         nome = COALESCE($1, nome),
         descricao = COALESCE($2, descricao),
         preco = COALESCE($3, preco),
         imagem_url = COALESCE($4, imagem_url),
         categoria_id = COALESCE($5, categoria_id),
         marca_id = COALESCE($6, marca_id),
         ativo = COALESCE($7, ativo)
       WHERE id = $8`,
      [nome, descricao, preco, imagem_url, categoria_id, marca_id, ativo, req.params.id]
    );

    if (rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    if (estilo_ids !== undefined) {
      if (!Array.isArray(estilo_ids)) estilo_ids = [estilo_ids];
      await client.query("DELETE FROM produto_estilos WHERE produto_id = $1", [req.params.id]);
      for (const estiloId of estilo_ids) {
        await client.query(
          "INSERT INTO produto_estilos (produto_id, estilo_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
          [req.params.id, Number(estiloId)]
        );
      }
    }

    if (variantes) await salvarVariantes(client, req.params.id, variantes);

    await client.query("COMMIT");
    return res.json({ message: "Produto atualizado" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  } finally {
    client.release();
  }
};

exports.deleteProduct = async (req, res) => {
  const client = await pool.connect();
  try {
    // Verifica se há pedidos com esse produto antes de apagar
    const { rows: pedidos } = await client.query(
      "SELECT 1 FROM itens_pedido WHERE produto_id = $1 LIMIT 1",
      [req.params.id]
    );
    if (pedidos.length > 0) {
      return res.status(409).json({
        message: "Não é possível remover: esse produto está em pedidos existentes"
      });
    }

    await client.query("BEGIN");

    // Remove as relações antes para evitar erro de FK
    await client.query("DELETE FROM produto_estilos WHERE produto_id = $1", [req.params.id]);
    await client.query("DELETE FROM variacoes_produto WHERE produto_id = $1", [req.params.id]);
    await client.query("DELETE FROM favoritos WHERE produto_id = $1", [req.params.id]);
    await client.query("DELETE FROM avaliacoes WHERE produto_id = $1", [req.params.id]);

    const { rowCount } = await client.query(
      "DELETE FROM produtos WHERE id = $1",
      [req.params.id]
    );

    if (rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    await client.query("COMMIT");
    return res.json({ message: "Produto removido" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  } finally {
    client.release();
  }
};
