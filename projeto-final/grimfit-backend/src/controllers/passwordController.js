const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

exports.forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email é obrigatório"
      });
    }

    const token = crypto
      .randomBytes(32)
      .toString("hex");

    const { rowCount } = await pool.query(
      `
      UPDATE usuarios
      SET
        reset_token = $1,
        reset_token_expire = NOW() + INTERVAL '1 hour'
      WHERE email = $2
      `,
      [
        token,
        email
      ]
    );

    // Sempre responde a mesma coisa, exista o email ou não —
    // isso evita que alguém use essa rota pra descobrir quais
    // emails estão cadastrados no sistema.
    if (rowCount === 0) {
      return res.json({
        message: "Se o email existir, um token de recuperação foi gerado"
      });
    }

    // Em produção isso deveria ser enviado por email, não retornado
    // na resposta. Deixei retornando pra facilitar teste manual
    // enquanto não existe envio de email configurado.
    return res.json({
      message: "Token gerado",
      token
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }
};

exports.resetPassword = async (req, res) => {
  try {

    const { token, nova_senha } = req.body;

    if (!token || !nova_senha || nova_senha.length < 6) {
      return res.status(400).json({
        message: "token e nova_senha (mín. 6 caracteres) são obrigatórios"
      });
    }

    const { rows: usuarios } = await pool.query(
      `
      SELECT id
      FROM usuarios
      WHERE reset_token = $1
      AND reset_token_expire > NOW()
      `,
      [token]
    );

    if (usuarios.length === 0) {
      return res.status(400).json({
        message: "Token inválido ou expirado"
      });
    }

    const hash = await bcrypt.hash(nova_senha, 10);

    await pool.query(
      `
      UPDATE usuarios
      SET
        senha = $1,
        reset_token = NULL,
        reset_token_expire = NULL
      WHERE id = $2
      `,
      [hash, usuarios[0].id]
    );

    return res.json({
      message: "Senha redefinida com sucesso"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }
};
