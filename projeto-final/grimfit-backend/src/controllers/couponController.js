const pool = require("../config/db");

exports.validateCoupon = async (req, res) => {

  try {

    const { codigo } = req.body;

    const { rows: cupom } = await pool.query(
      `
      SELECT *
      FROM cupons
      WHERE codigo = $1
      AND ativo = TRUE
      `,
      [codigo]
    );

    if (cupom.length === 0) {

      return res.status(404).json({
        message: "Cupom inválido"
      });

    }

    return res.json(cupom[0]);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};
