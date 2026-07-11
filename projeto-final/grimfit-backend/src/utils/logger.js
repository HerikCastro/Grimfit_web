const pool = require("../config/db");

module.exports = async (
  usuario_id,
  acao,
  tabela
) => {

  try {

    await pool.query(
      `
      INSERT INTO logs_sistema
      (
        usuario_id,
        acao,
        tabela_afetada
      )
      VALUES ($1, $2, $3)
      `,
      [
        usuario_id,
        acao,
        tabela
      ]
    );

  } catch (error) {

    console.log(error);

  }

};
