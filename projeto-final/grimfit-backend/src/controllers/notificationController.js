const pool = require("../config/db");

exports.getNotifications = async (req, res) => {

  try {

    const { rows } = await pool.query(
      `
      SELECT *
      FROM notificacoes
      WHERE usuario_id = $1
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

exports.markAsRead = async (req, res) => {

  try {

    const { rowCount } = await pool.query(
      `
      UPDATE notificacoes
      SET lida = TRUE
      WHERE id = $1
      AND usuario_id = $2
      `,
      [req.params.id, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Notificação não encontrada"
      });
    }

    return res.json({
      message: "Notificação marcada como lida"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.deleteNotification = async (req, res) => {

  try {

    const { rowCount } = await pool.query(
      `
      DELETE FROM notificacoes
      WHERE id = $1
      AND usuario_id = $2
      `,
      [req.params.id, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Notificação não encontrada"
      });
    }

    return res.json({
      message: "Notificação removida"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};
