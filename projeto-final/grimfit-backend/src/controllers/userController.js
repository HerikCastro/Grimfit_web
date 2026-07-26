const bcrypt = require("bcryptjs");
const pool = require("../config/db");

exports.profile = async (req, res) => {

  try {

    const { rows: usuario } =
      await pool.query(
        `
        SELECT
        id,
        nome,
        email,
        telefone,
        tipo
        FROM usuarios
        WHERE id = $1
        `,
        [req.user.id]
      );

    return res.json(
      usuario[0]
    );

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.updateProfile = async (req, res) => {

  try {

    const { nome, telefone } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        message: "Nome é obrigatório"
      });
    }

    await pool.query(
      `
      UPDATE usuarios
      SET
        nome = $1,
        telefone = $2
      WHERE id = $3
      `,
      [nome, telefone, req.user.id]
    );

    return res.json({
      message: "Perfil atualizado"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.changePassword = async (req, res) => {

  try {

    const { senha_atual, nova_senha } = req.body;

    if (!senha_atual || !nova_senha || nova_senha.length < 6) {
      return res.status(400).json({
        message: "senha_atual e nova_senha (mín. 6 caracteres) são obrigatórios"
      });
    }

    const { rows: usuarios } = await pool.query(
      "SELECT senha FROM usuarios WHERE id = $1",
      [req.user.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        message: "Usuário não encontrado"
      });
    }

    const senhaValida = await bcrypt.compare(
      senha_atual,
      usuarios[0].senha
    );

    if (!senhaValida) {
      return res.status(400).json({
        message: "Senha atual incorreta"
      });
    }

    const hash = await bcrypt.hash(nova_senha, 10);

    await pool.query(
      "UPDATE usuarios SET senha = $1 WHERE id = $2",
      [hash, req.user.id]
    );

    return res.json({
      message: "Senha alterada com sucesso"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};
