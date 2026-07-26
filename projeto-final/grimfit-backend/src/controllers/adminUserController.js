const pool = require("../config/db");

const TIPOS_VALIDOS = ["cliente", "admin", "suporte"];

exports.getUsers = async (req, res) => {

  try {

    const { rows: users } =
      await pool.query(
        `
        SELECT
        id,
        nome,
        email,
        telefone,
        tipo
        FROM usuarios
        `
      );

    return res.json(users);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.updateUserType = async (req, res) => {

  try {

    const { tipo } = req.body;

    if (!TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({
        message: `tipo precisa ser um de: ${TIPOS_VALIDOS.join(", ")}`
      });
    }

    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({
        message: "Você não pode alterar o próprio tipo de acesso"
      });
    }

    const { rowCount } = await pool.query(
      `
      UPDATE usuarios
      SET tipo = $1
      WHERE id = $2
      `,
      [tipo, req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Usuário não encontrado"
      });
    }

    return res.json({
      message: "Tipo de usuário atualizado"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.deleteUser = async (req, res) => {

  try {

    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({
        message: "Você não pode remover a própria conta por aqui"
      });
    }

    const { rowCount } = await pool.query(
      `
      DELETE FROM usuarios
      WHERE id = $1
      `,
      [req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Usuário não encontrado"
      });
    }

    return res.json({
      message: "Usuário removido"
    });

  } catch (error) {

    // usuarios.id é referenciado por pedidos/logs_sistema sem
    // ON DELETE CASCADE — se o usuário já tiver pedido, o Postgres
    // barra o delete pra não deixar pedido órfão.
    if (error.code === "23503") {
      return res.status(409).json({
        message: "Não é possível remover: esse usuário tem pedidos ou registros vinculados"
      });
    }

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};
