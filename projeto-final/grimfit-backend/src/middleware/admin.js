const pool = require("../config/db");

module.exports = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT tipo FROM usuarios WHERE id = $1",
      [req.user.id]
    );

    if (rows.length === 0 || rows[0].tipo !== "admin") {
      return res.status(403).json({
        message: "Acesso negado"
      });
    }

    next();
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });
  }
};