const pool = require("../config/db");

exports.getAddresses = async (req, res) => {

  try {

    const { rows: enderecos } = await pool.query(
      `
      SELECT *
      FROM enderecos
      WHERE usuario_id = $1
      `,
      [req.user.id]
    );

    return res.json(enderecos);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.createAddress = async (req, res) => {

  try {

    const {
      apelido,
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado
    } = req.body;

    await pool.query(
      `
      INSERT INTO enderecos
      (
        usuario_id,
        apelido,
        cep,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        req.user.id,
        apelido,
        cep,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        estado
      ]
    );

    return res.status(201).json({
      message: "Endereço criado"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.deleteAddress = async (req, res) => {

  try {

    await pool.query(
      `
      DELETE FROM enderecos
      WHERE id = $1
      AND usuario_id = $2
      `,
      [
        req.params.id,
        req.user.id
      ]
    );

    return res.json({
      message: "Endereço removido"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};
