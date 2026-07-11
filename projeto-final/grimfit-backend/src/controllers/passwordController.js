const crypto = require("crypto");
const pool = require("../config/db");

exports.forgotPassword = async (req, res) => {
  try {

    const token = crypto
      .randomBytes(32)
      .toString("hex");

    await pool.query(
      `
      UPDATE usuarios
      SET
        reset_token = $1,
        reset_token_expire = NOW() + INTERVAL '1 hour'
      WHERE email = $2
      `,
      [
        token,
        req.body.email
      ]
    );

    return res.json({
      token
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }
};
