const pool = require("../config/db");

async function podeAcessarTicket(ticketId, user) {

  const { rows } = await pool.query(
    "SELECT usuario_id FROM tickets WHERE id = $1",
    [ticketId]
  );

  if (rows.length === 0) {
    return false;
  }

  const isStaff = user.tipo === "admin" || user.tipo === "suporte";

  return isStaff || rows[0].usuario_id === user.id;
}

exports.getMessages = async (req, res) => {

  try {

    const permitido = await podeAcessarTicket(req.params.ticketId, req.user);

    if (!permitido) {
      return res.status(404).json({
        message: "Ticket não encontrado"
      });
    }

    const { rows: mensagens } = await pool.query(
      `
      SELECT
        m.*,
        u.nome
      FROM mensagens_ticket m
      JOIN usuarios u ON u.id = m.usuario_id
      WHERE m.ticket_id = $1
      ORDER BY m.created_at ASC
      `,
      [req.params.ticketId]
    );

    return res.json(mensagens);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.createMessage = async (req, res) => {

  try {

    const { mensagem } = req.body;

    if (!mensagem || !mensagem.trim()) {
      return res.status(400).json({
        message: "mensagem é obrigatória"
      });
    }

    const permitido = await podeAcessarTicket(req.params.ticketId, req.user);

    if (!permitido) {
      return res.status(404).json({
        message: "Ticket não encontrado"
      });
    }

    await pool.query(
      `
      INSERT INTO mensagens_ticket
      (ticket_id, usuario_id, mensagem)
      VALUES ($1, $2, $3)
      `,
      [req.params.ticketId, req.user.id, mensagem]
    );

    // Quando o cliente responde um ticket fechado, reabre pra
    // não ficar mensagem "perdida" num ticket encerrado.
    await pool.query(
      `
      UPDATE tickets
      SET status = 'em_atendimento'
      WHERE id = $1
      AND status != 'fechado'
      `,
      [req.params.ticketId]
    );

    return res.status(201).json({
      message: "Mensagem enviada"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};
