const pool = require("../config/db");

const STATUS_VALIDOS = [
  "pendente", "pago", "separacao", "enviado",
  "saiu_entrega", "entregue", "cancelado"
];

exports.getOrders = async (req, res) => {

  try {

    const { rows: orders } =
      await pool.query(
        `
        SELECT
          p.*,
          u.nome AS usuario_nome,
          u.email AS usuario_email
        FROM pedidos p
        JOIN usuarios u ON u.id = p.usuario_id
        ORDER BY p.created_at DESC
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

    const { status } = req.body;

    if (!STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({
        message: `status precisa ser um de: ${STATUS_VALIDOS.join(", ")}`
      });
    }

    const { rowCount } = await pool.query(
      `
      UPDATE pedidos
      SET status = $1
      WHERE id = $2
      `,
      [
        status,
        req.params.id
      ]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Pedido não encontrado"
      });
    }

    return res.json({
      message: "Status atualizado"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};      SET status = $1
      WHERE id = $2
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
