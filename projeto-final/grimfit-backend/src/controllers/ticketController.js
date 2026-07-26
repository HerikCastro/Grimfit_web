const pool = require("../config/db");

exports.createTicket = async (req, res) => {

  try {

    const { assunto } = req.body;

    if (!assunto || !assunto.trim()) {
      return res.status(400).json({
        message: "assunto é obrigatório"
      });
    }

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
      ORDER BY created_at DESC
    `, [req.user.id]);

    return res.json(tickets);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.getTicketById = async (req, res) => {

  try {

    const { rows: tickets } = await pool.query(
      `
      SELECT *
      FROM tickets
      WHERE id = $1
      AND (usuario_id = $2 OR $3 = true)
      `,
      [req.params.id, req.user.id, req.user.tipo === "admin" || req.user.tipo === "suporte"]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        message: "Ticket não encontrado"
      });
    }

    return res.json(tickets[0]);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};
