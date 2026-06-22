const pool = require("../config/db");

exports.getTickets = async (req, res) => {

  try {

    const [tickets] =
      await pool.query(
        `
        SELECT *
        FROM tickets
        ORDER BY created_at DESC
        `
      );

    return res.json(tickets);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};