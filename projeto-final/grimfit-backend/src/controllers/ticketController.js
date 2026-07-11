const pool = require("../config/db");

exports.createTicket = async (req, res) => {

  try {

    const { assunto } = req.body;

    const { rows: [ticket] } = await pool.query(`
      INSERT INTO tickets
      (
        usuario_id,
        assunto
      )
      VALUES ($1, $2)
      RETURNING id
    `, [
      req.user.id,
      assunto
    ]);

    return res.status(201).json({
      ticket_id: ticket.id
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.getMyTickets = async (req, res) => {

  try {

    const { rows: tickets } = await pool.query(`
      SELECT *
      FROM tickets
      WHERE usuario_id = $1
    `, [req.user.id]);

    return res.json(tickets);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};
