const pool = require("../config/db");
const uploadImage = require("../utils/uploadImage");

const ORDENACOES = {
  recentes: "p.created_at DESC",
  preco_asc: "p.preco ASC",
  preco_desc: "p.preco DESC",
  nome_asc: "p.nome ASC"
};

exports.getProducts = async (req, res) => {

  try {

    const {
      busca,
      categoria_id,
      marca_id,
      preco_min,
      preco_max,
      ordenar,
      page,
      limit
    } = req.query;

    const condicoes = ["p.ativo = TRUE"];
    const valores = [];

    if (busca && busca.trim()) {
      valores.push(`%${busca.trim()}%`);
      condicoes.push(
        `(p.nome ILIKE $${valores.length} OR p.descricao ILIKE $${valores.length})`
      );
    }

    if (categoria_id) {
      valores.push(categoria_id);
      condicoes.push(`p.categoria_id = $${valores.length}`);
    }

    if (marca_id) {
      valores.push(marca_id);
      condicoes.push(`p.marca_id = $${valores.length}`);
    }

    if (preco_min) {
      valores.push(preco_min);
      condicoes.push(`p.preco >= $${valores.length}`);
    }

    if (preco_max) {
      valores.push(preco_max);
      condicoes.push(`p.preco <= $${valores.length}`);
    }

    const ordem = ORDENACOES[ordenar] || ORDENACOES.recentes;

    const paginaAtual = Math.max(parseInt(page, 10) || 1, 1);
    const porPagina = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (paginaAtual - 1) * porPagina;

    valores.push(porPagina);
    const paramLimit = valores.length;

    valores.push(offset);
    const paramOffset = valores.length;

    const query = `
      SELECT p.*, c.nome AS categoria_nome, m.nome AS marca_nome
      FROM produtos p
      LEFT JOIN categorias c ON c.id = p.categoria_id
      LEFT JOIN marcas m ON m.id = p.marca_id
      WHERE ${condicoes.join(" AND ")}
      ORDER BY ${ordem}
      LIMIT $${paramLimit}
      OFFSET $${paramOffset}
    `;

    const { rows: produtos } = await pool.query(query, valores);

    return res.json({
      produtos,
      pagina: paginaAtual,
      por_pagina: porPagina
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.getProductById = async (req, res) => {

  try {

    const { rows: produto } =
      await pool.query(
        `
        SELECT *
        FROM produtos
        WHERE id = $1
        `,
        [req.params.id]
      );

    if (produto.length === 0) {
      return res.status(404).json({
        message: "Produto não encontrado"
      });
    }

    return res.json(produto[0]);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.createProduct = async (req, res) => {

  try {

    const {
      nome,
      descricao,
      preco,
      categoria_id,
      marca_id
    } = req.body;

    if (!nome || !nome.trim() || !preco || preco <= 0) {
      return res.status(400).json({
        message: "nome e preco (> 0) são obrigatórios"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Imagem é obrigatória"
      });
    }

    const imagem_url = await uploadImage(req.file.buffer, "produtos");

    await pool.query(
      `
      INSERT INTO produtos
      (
        nome,
        descricao,
        preco,
        imagem_url,
        categoria_id,
        marca_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        nome,
        descricao,
        preco,
        imagem_url,
        categoria_id,
        marca_id
      ]
    );

    return res.status(201).json({
      message: "Produto criado"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.deleteProduct = async (req, res) => {

  try {

    await pool.query(
      `
      DELETE FROM produtos
      WHERE id = $1
      `,
      [req.params.id]
    );

    return res.json({
      message: "Produto removido"
    });

  } catch (error) {

    if (error.code === "23503") {
      return res.status(409).json({
        message: "Não é possível remover: existem pedidos ou variações vinculadas a esse produto"
      });
    }

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.updateProduct = async (req, res) => {

  try {

    const {
      nome,
      descricao,
      preco,
      categoria_id,
      marca_id,
      ativo
    } = req.body;

    // Imagem só troca se vier um arquivo novo no upload.
    let imagem_url = null;

    if (req.file) {
      imagem_url = await uploadImage(req.file.buffer, "produtos");
    }

    const { rowCount } = await pool.query(
      `
      UPDATE produtos
      SET
        nome = COALESCE($1, nome),
        descricao = COALESCE($2, descricao),
        preco = COALESCE($3, preco),
        imagem_url = COALESCE($4, imagem_url),
        categoria_id = COALESCE($5, categoria_id),
        marca_id = COALESCE($6, marca_id),
        ativo = COALESCE($7, ativo)
      WHERE id = $8
      `,
      [
        nome,
        descricao,
        preco,
        imagem_url,
        categoria_id,
        marca_id,
        ativo,
        req.params.id
      ]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Produto não encontrado"
      });
    }

    return res.json({
      message: "Produto atualizado"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};
