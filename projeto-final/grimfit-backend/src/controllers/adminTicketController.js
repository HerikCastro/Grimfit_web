const pool = require("../config/db");

exports.getTickets = async (req, res) => {

  try {

    const { rows: tickets } =
      await pool.query(
        `
        SELECT
          t.*,
          u.nome,
          u.email
        FROM tickets t
        JOIN usuarios u ON u.id = t.usuario_id
        ORDER BY t.created_at DESC
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

exports.updateTicketStatus = async (req, res) => {

  try {

    const { status } = req.body;

    const validos = ["aberto", "em_atendimento", "fechado"];

    if (!validos.includes(status)) {
      return res.status(400).json({
        message: `status precisa ser um de: ${validos.join(", ")}`
      });
    }

    const { rowCount } = await pool.query(
      `
      UPDATE tickets
      SET status = $1
      WHERE id = $2
      `,
      [status, req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Ticket não encontrado"
      });
    }

    return res.json({
      message: "Status do ticket atualizado"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};
