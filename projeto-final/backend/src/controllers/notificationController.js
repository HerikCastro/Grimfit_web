const pool = require("../config/db");

exports.getNotifications = async (req, res) => {

  try {

    const [rows] = await pool.query(
      `
      SELECT *
      FROM notificacoes
      WHERE usuario_id = ?
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    return res.json(rows);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};