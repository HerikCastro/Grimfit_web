const pool = require("../config/db");
const uploadImage = require("../utils/uploadImage");

function readVariants(body) {
  if (body.variants === undefined) return undefined;

  const variants = typeof body.variants === "string"
    ? JSON.parse(body.variants)
    : body.variants;

  if (!Array.isArray(variants)) {
    throw new Error("variantes precisa ser uma lista");
  }

  return variants.map((variant) => {
    const stock = Number(variant.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      throw new Error("estoque das variantes precisa ser um número inteiro maior ou igual a zero");
    }
    return {
      id: variant.id ? Number(variant.id) : null,
      size: variant.size || null,
      color: variant.color || null,
      stock
    };
  });
}

async function saveVariants(client, productId, variants) {
  for (const variant of variants) {
    if (variant.id) {
      const { rowCount } = await client.query(
        `UPDATE variacoes_produto
         SET tamanho = $1, cor = $2, estoque = $3
         WHERE id = $4 AND produto_id = $5`,
        [variant.size, variant.color, variant.stock, variant.id, productId]
      );
      if (rowCount === 0) throw new Error("Variação não pertence a este produto");
    } else {
      await client.query(
        `INSERT INTO variacoes_produto (produto_id, tamanho, cor, estoque)
         VALUES ($1, $2, $3, $4)`,
        [productId, variant.size, variant.color, variant.stock]
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
    const { search, categoryId, brandId, styleId, minPrice, maxPrice, sort, page, limit } = req.query;
    const conditions = ["p.ativo = TRUE"];
    const values = [];

    if (search && search.trim()) {
      values.push(`%${search.trim()}%`);
      conditions.push(`(p.nome ILIKE $${values.length} OR p.descricao ILIKE $${values.length})`);
    }
    if (categoryId) { values.push(categoryId); conditions.push(`p.categoria_id = $${values.length}`); }
    if (brandId) { values.push(brandId); conditions.push(`p.marca_id = $${values.length}`); }
    if (minPrice) { values.push(minPrice); conditions.push(`p.preco >= $${values.length}`); }
    if (maxPrice) { values.push(maxPrice); conditions.push(`p.preco <= $${values.length}`); }

    if (styleId) {
      values.push(styleId);
      conditions.push(`EXISTS (SELECT 1 FROM produto_estilos pe WHERE pe.produto_id = p.id AND pe.estilo_id = $${values.length})`);
    }

    const order = ORDENACOES[sort] || ORDENACOES.recentes;
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (currentPage - 1) * pageSize;

    values.push(pageSize);
    const limitParameter = values.length;
    values.push(offset);
    const offsetParameter = values.length;

    const query = `
      SELECT p.id,
             p.nome AS "name",
             p.descricao AS "description",
             p.preco AS "price",
             p.imagem_url AS "imageUrl",
             p.categoria_id AS "categoryId",
             p.marca_id AS "brandId",
             p.ativo AS "active",
             c.nome AS "categoryName",
             m.nome AS "brandName",
             COALESCE(
               json_agg(DISTINCT jsonb_build_object('id', e.id, 'name', e.nome))
               FILTER (WHERE e.id IS NOT NULL),
               '[]'
             ) AS "styles"
      FROM produtos p
      LEFT JOIN categorias c ON c.id = p.categoria_id
      LEFT JOIN marcas m ON m.id = p.marca_id
      LEFT JOIN produto_estilos pe ON pe.produto_id = p.id
      LEFT JOIN estilos e ON e.id = pe.estilo_id
      WHERE ${conditions.join(" AND ")}
      GROUP BY p.id, c.nome, m.nome
      ORDER BY ${order}
      LIMIT $${limitParameter}
      OFFSET $${offsetParameter}
    `;

    const { rows: products } = await pool.query(query, values);
    return res.json({ products, page: currentPage, perPage: pageSize });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.id,
              p.nome AS "name",
              p.descricao AS "description",
              p.preco AS "price",
              p.imagem_url AS "imageUrl",
              p.categoria_id AS "categoryId",
              p.marca_id AS "brandId",
              p.ativo AS "active",
              COALESCE(
                json_agg(DISTINCT jsonb_build_object('id', e.id, 'name', e.nome))
                FILTER (WHERE e.id IS NOT NULL),
                '[]'
              ) AS "styles"
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
    const { name, description, price, categoryId, brandId } = req.body;
    let styleIds = req.body['styleIds[]'] || req.body.styleIds || [];
    if (!Array.isArray(styleIds)) styleIds = [styleIds];
    let variants;
    try {
      variants = readVariants(req.body);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    if (!name || !name.trim() || !price || price <= 0) {
      return res.status(400).json({ message: "nome e preco (> 0) são obrigatórios" });
    }
    if (!req.file) return res.status(400).json({ message: "Imagem é obrigatória" });

    const imageUrl = await uploadImage(req.file.buffer, "produtos");

    await client.query("BEGIN");

    const { rows: [product] } = await client.query(
      `INSERT INTO produtos (nome, descricao, preco, imagem_url, categoria_id, marca_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [name, description, price, imageUrl, categoryId || null, brandId || null]
    );

    for (const styleId of styleIds) {
      await client.query(
        "INSERT INTO produto_estilos (produto_id, estilo_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
        [product.id, Number(styleId)]
      );
    }

    if (variants) await saveVariants(client, product.id, variants);

    await client.query("COMMIT");
    return res.status(201).json({ message: "Produto criado", id: product.id });
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
    const { name, description, price, categoryId, brandId, active } = req.body;
    let styleIds = req.body['styleIds[]'] || req.body.styleIds;
    let variants;
    try {
      variants = readVariants(req.body);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    let imageUrl = null;
    if (req.file) imageUrl = await uploadImage(req.file.buffer, "produtos");

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
      [name, description, price, imageUrl, categoryId, brandId, active, req.params.id]
    );

    if (rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    if (styleIds !== undefined) {
      if (!Array.isArray(styleIds)) styleIds = [styleIds];
      await client.query("DELETE FROM produto_estilos WHERE produto_id = $1", [req.params.id]);
      for (const styleId of styleIds) {
        await client.query(
          "INSERT INTO produto_estilos (produto_id, estilo_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
          [req.params.id, Number(styleId)]
        );
      }
    }

    if (variants) await saveVariants(client, req.params.id, variants);

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
