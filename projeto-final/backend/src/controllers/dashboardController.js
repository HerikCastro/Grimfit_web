const pool = require("../config/db");

exports.dashboard = async (req, res) => {

  try {

    const [[usuarios]] =
      await pool.query(
        "SELECT COUNT(*) total FROM usuarios"
      );

    const [[produtos]] =
      await pool.query(
        "SELECT COUNT(*) total FROM produtos"
      );

    const [[pedidos]] =
      await pool.query(
        "SELECT COUNT(*) total FROM pedidos"
      );

    const [[faturamento]] =
      await pool.query(
        `
        SELECT
        IFNULL(SUM(valor_total),0)
        total
        FROM pedidos
        WHERE status != 'cancelado'
        `
      );

    return res.json({
      usuarios: usuarios.total,
      produtos: produtos.total,
      pedidos: pedidos.total,
      faturamento: faturamento.total
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};