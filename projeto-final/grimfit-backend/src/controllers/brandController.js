const pool = require("../config/db");
const uploadImage = require("../utils/uploadImage");

exports.getBrands = async (req, res) => {
  try {

    const { rows: marcas } =
      await pool.query(
        "SELECT * FROM marcas"
      );

    return res.json(marcas);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }
};

exports.getBrandById = async (req, res) => {
  try {

    const { rows: marca } =
      await pool.query(
        "SELECT * FROM marcas WHERE id = $1",
        [req.params.id]
      );

    if (marca.length === 0) {
      return res.status(404).json({
        message: "Marca não encontrada"
      });
    }

    return res.json(marca[0]);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }
};

exports.createBrand = async (req, res) => {
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

    const imagem_url = await uploadImage(req.file.buffer, "marcas");

    await pool.query(
      `
      INSERT INTO marcas(nome, imagem_url)
      VALUES($1, $2)
      `,
      [nome, imagem_url]
    );

    return res.status(201).json({
      message: "Marca criada"
    });

  } catch (error) {

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Já existe uma marca com esse nome"
      });
    }

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }
};

exports.updateBrand = async (req, res) => {
  try {

    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        message: "Nome é obrigatório"
      });
    }

    let imagem_url = null;

    if (req.file) {
      imagem_url = await uploadImage(req.file.buffer, "marcas");
    }

    const { rowCount } = await pool.query(
      `
      UPDATE marcas
      SET
        nome = $1,
        imagem_url = COALESCE($2, imagem_url)
      WHERE id = $3
      `,
      [nome, imagem_url, req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Marca não encontrada"
      });
    }

    return res.json({
      message: "Marca atualizada"
    });

  } catch (error) {

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Já existe uma marca com esse nome"
      });
    }

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }
};

exports.deleteBrand = async (req, res) => {
  try {

    await pool.query(
      `
      DELETE FROM marcas
      WHERE id = $1
      `,
      [req.params.id]
    );

    return res.json({
      message: "Marca removida"
    });

  } catch (error) {

    if (error.code === "23503") {
      return res.status(409).json({
        message: "Não é possível remover: existem produtos usando essa marca"
      });
    }

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }
};
