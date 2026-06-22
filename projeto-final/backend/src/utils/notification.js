const pool = require("../config/db");

module.exports = async (
  usuario_id,
  titulo,
  mensagem
) => {

  try {

    await pool.query(
      `
      INSERT INTO notificacoes
      (
        usuario_id,
        titulo,
        mensagem
      )
      VALUES
      (?, ?, ?)
      `,
      [
        usuario_id,
        titulo,
        mensagem
      ]
    );

  } catch (error) {

    console.log(error);

  }

};