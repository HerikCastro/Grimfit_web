const pool = require("../config/db");
const uploadImage = require("../utils/uploadImage");

exports.getCategories = async (req, res) => {
  try {

    const { rows: categorias } =
      await pool.query(
        "SELECT * FROM categorias"
      );

    return res.json(categorias);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }
};

exports.getCategoryById = async (req, res) => {
  try {

    const { rows: categoria } =
      await pool.query(
        "SELECT * FROM categorias WHERE id = $1",
        [req.params.id]
      );

    if (categoria.length === 0) {
      return res.status(404).json({
        message: "Categoria não encontrada"
      });
    }

    return res.json(categoria[0]);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }
};

exports.createCategory = async (req, res) => {
  try {

    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        message: "Nome é obrigatório"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Imagem é obrigatória"
      });
    }

    const imagem_url = await uploadImage(req.file.buffer, "categorias");

    await pool.query(
      `
      INSERT INTO categorias(nome, imagem_url)
      VALUES($1, $2)
      `,
      [nome, imagem_url]
    );

    return res.status(201).json({
      message: "Categoria criada"
    });

  } catch (error) {

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Já existe uma categoria com esse nome"
      });
    }

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }
};

exports.updateCategory = async (req, res) => {
  try {

    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        message: "Nome é obrigatório"
      });
    }

    // Imagem é opcional na edição — só troca se mandar um arquivo novo.
    let imagem_url = null;

    if (req.file) {
      imagem_url = await uploadImage(req.file.buffer, "categorias");
    }

    const { rowCount } = await pool.query(
      `
      UPDATE categorias
      SET
        nome = $1,
        imagem_url = COALESCE($2, imagem_url)
      WHERE id = $3
      `,
      [nome, imagem_url, req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Categoria não encontrada"
      });
    }

    return res.json({
      message: "Categoria atualizada"
    });

  } catch (error) {

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Já existe uma categoria com esse nome"
      });
    }

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }
};

exports.deleteCategory = async (req, res) => {
  try {

    await pool.query(
      `
      DELETE FROM categorias
      WHERE id = $1
      `,
      [req.params.id]
    );

    return res.json({
      message: "Categoria removida"
    });

  } catch (error) {

    if (error.code === "23503") {
      return res.status(409).json({
        message: "Não é possível remover: existem produtos usando essa categoria"
      });
    }

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }
};
