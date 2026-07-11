const pool = require("../config/db");

module.exports = async (
  pedido_id,
  status
) => {

  try {

    await pool.query(
      `
      INSERT INTO historico_rastreamento
      (
        rastreamento_id,
        status,
        descricao,
        data_evento
      )
      VALUES
      (
        $1,
        $2,
        $3,
        NOW()
      )
      `,
      [
        pedido_id,
        status,
        status
      ]
    );

  } catch (error) {

    console.log(error);

  }

};
