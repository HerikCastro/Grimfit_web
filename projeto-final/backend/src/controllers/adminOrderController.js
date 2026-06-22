const pool = require("../config/db");

exports.getOrders = async (req, res) => {

  try {

    const [orders] =
      await pool.query(
        `
        SELECT *
        FROM pedidos
        ORDER BY created_at DESC
        `
      );

    return res.json(orders);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.updateStatus = async (req, res) => {

  try {

    await pool.query(
      `
      UPDATE pedidos
      SET status = ?
      WHERE id = ?
      `,
      [
        req.body.status,
        req.params.id
      ]
    );

    return res.json({
      message: "Status atualizado"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};