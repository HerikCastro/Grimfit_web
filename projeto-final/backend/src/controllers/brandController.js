const pool = require("../config/db");

exports.getBrands = async (req, res) => {
  try {

    const [marcas] =
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

exports.createBrand = async (req, res) => {
  try {

    const { nome } = req.body;

    await pool.query(
      `
      INSERT INTO marcas(nome)
      VALUES(?)
      `,
      [nome]
    );

    return res.status(201).json({
      message: "Marca criada"
    });

  } catch (error) {

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
      WHERE id = ?
      `,
      [req.params.id]
    );

    return res.json({
      message: "Marca removida"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }
};