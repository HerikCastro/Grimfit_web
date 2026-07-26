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
      AND (validade IS NULL OR validade > NOW())
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

exports.getCoupons = async (req, res) => {

  try {

    const { rows: cupons } = await pool.query(
      "SELECT * FROM cupons ORDER BY created_at DESC"
    );

    return res.json(cupons);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.createCoupon = async (req, res) => {

  try {

    const { codigo, desconto, validade } = req.body;

    if (!codigo || !desconto || desconto <= 0) {
      return res.status(400).json({
        message: "codigo e desconto (> 0) são obrigatórios"
      });
    }

    await pool.query(
      `
      INSERT INTO cupons
      (codigo, desconto, validade)
      VALUES ($1, $2, $3)
      `,
      [codigo.toUpperCase(), desconto, validade || null]
    );

    return res.status(201).json({
      message: "Cupom criado"
    });

  } catch (error) {

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Já existe um cupom com esse código"
      });
    }

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.updateCoupon = async (req, res) => {

  try {

    const { desconto, ativo, validade } = req.body;

    const { rowCount } = await pool.query(
      `
      UPDATE cupons
      SET
        desconto = COALESCE($1, desconto),
        ativo = COALESCE($2, ativo),
        validade = COALESCE($3, validade)
      WHERE id = $4
      `,
      [desconto, ativo, validade, req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Cupom não encontrado"
      });
    }

    return res.json({
      message: "Cupom atualizado"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.deleteCoupon = async (req, res) => {

  try {

    const { rowCount } = await pool.query(
      "DELETE FROM cupons WHERE id = $1",
      [req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Cupom não encontrado"
      });
    }

    return res.json({
      message: "Cupom removido"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};
