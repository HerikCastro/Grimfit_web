const pool = require("../config/db");

exports.getUsers = async (req, res) => {

  try {

    const { rows: users } =
      await pool.query(
        `
        SELECT
        id,
        nome,
        email,
        telefone,
        tipo
        FROM usuarios
        `
      );

    return res.json(users);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};
