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
      ($1, $2, $3)
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
