const pool = require("../config/db");

exports.getProducts = async (req, res) => {

  try {

    const [produtos] =
      await pool.query(
        "SELECT * FROM produtos WHERE ativo = TRUE"
      );

    return res.json(produtos);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.getProductById = async (req, res) => {

  try {

    const [produto] =
      await pool.query(
        `
        SELECT *
        FROM produtos
        WHERE id = ?
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
      imagem_url,
      categoria_id,
      marca_id
    } = req.body;

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
      VALUES (?, ?, ?, ?, ?, ?)
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
      WHERE id = ?
      `,
      [req.params.id]
    );

    return res.json({
      message: "Produto removido"
    });

  } catch (error) {

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
      preco
    } = req.body;

    await pool.query(
      `
      UPDATE produtos
      SET
        nome = ?,
        descricao = ?,
        preco = ?
      WHERE id = ?
      `,
      [
        nome,
        descricao,
        preco,
        req.params.id
      ]
    );

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