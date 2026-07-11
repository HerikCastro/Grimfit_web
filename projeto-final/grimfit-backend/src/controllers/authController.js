const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const {
      nome,
      email,
      senha,
      telefone
    } = req.body;

    const { rows: usuario } =
      await pool.query(
        "SELECT id FROM usuarios WHERE email = $1",
        [email]
      );

    if (usuario.length > 0) {
      return res.status(400).json({
        message: "Email já cadastrado"
      });
    }

    const hash =
      await bcrypt.hash(senha, 10);

    await pool.query(
      `
      INSERT INTO usuarios
      (nome,email,senha,telefone)
      VALUES ($1,$2,$3,$4)
      `,
      [
        nome,
        email,
        hash,
        telefone
      ]
    );

    return res.status(201).json({
      ok: true,
      message: "Usuário criado"
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });
  }
};

exports.login = async (req, res) => {
  try {

    const {
      email,
      senha
    } = req.body;

    const { rows: usuarios } =
      await pool.query(
        "SELECT * FROM usuarios WHERE email = $1",
        [email]
      );

    if (usuarios.length === 0) {
      return res.status(400).json({
        message: "Usuário não encontrado"
      });
    }

    const user = usuarios[0];

    const senhaValida =
      await bcrypt.compare(
        senha,
        user.senha
      );

    if (!senhaValida) {
      return res.status(400).json({
        message: "Senha inválida"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        tipo: user.tipo
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.json({
      ok: true,
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        tipo: user.tipo
      }
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }
};
