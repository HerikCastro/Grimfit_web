const pool = require("../config/db");

exports.profile = async (req, res) => {

  try {

    const { rows: usuario } =
      await pool.query(
        `
        SELECT
        id,
        nome,
        email,
        telefone,
        tipo
        FROM usuarios
        WHERE id = $1
        `,
        [req.user.id]
      );

    return res.json(
      usuario[0]
    );

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};
