const pool = require("../config/db");

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

exports.createCategory = async (req, res) => {
  try {

    const { nome } = req.body;

    await pool.query(
      `
      INSERT INTO categorias(nome)
      VALUES($1)
      `,
      [nome]
    );

    return res.status(201).json({
      message: "Categoria criada"
    });

  } catch (error) {

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

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }
};
