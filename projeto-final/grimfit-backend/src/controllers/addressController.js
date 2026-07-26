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

exports.updateAddress = async (req, res) => {

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

    const { rowCount } = await pool.query(
      `
      UPDATE enderecos
      SET
        apelido = $1,
        cep = $2,
        rua = $3,
        numero = $4,
        complemento = $5,
        bairro = $6,
        cidade = $7,
        estado = $8
      WHERE id = $9
      AND usuario_id = $10
      `,
      [
        apelido,
        cep,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        req.params.id,
        req.user.id
      ]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Endereço não encontrado"
      });
    }

    return res.json({
      message: "Endereço atualizado"
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
