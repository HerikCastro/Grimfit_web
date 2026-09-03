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

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email é obrigatório"
      });
    }

    // Guarda sempre em minúsculo — evita "Joao@Gmail.com" e
    // "joao@gmail.com" virarem duas contas diferentes, e evita
    // login falhar por causa da caixa da letra.
    const emailNormalizado = email.trim().toLowerCase();

    // LOWER() nos dois lados também pega contas antigas que já
    // foram salvas com maiúscula antes dessa correção existir.
    const { rows: usuario } =
      await pool.query(
        "SELECT id FROM usuarios WHERE LOWER(email) = $1",
        [emailNormalizado]
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
        emailNormalizado,
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

    if (!email || !senha) {
      return res.status(400).json({
        message: "Email e senha são obrigatórios"
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const { rows: usuarios } =
      await pool.query(
        "SELECT * FROM usuarios WHERE LOWER(email) = $1",
        [emailNormalizado]
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
        foto_url: user.foto_url,
        tipo: user.tipo,
        preferencias_definidas: user.preferencias_definidas
      }
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }
};