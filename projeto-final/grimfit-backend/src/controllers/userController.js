const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const uploadImage = require("../utils/uploadImage");

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
        foto_url,
        tipo,
        genero,
        preferencias_definidas
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

const GENEROS_VALIDOS = ["masculino", "feminino", "prefiro_nao_informar", "outro"];

exports.updateProfile = async (req, res) => {

  try {

    const { nome, email, telefone, genero } = req.body;
    const emailNormalizado = email?.trim().toLowerCase();

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        message: "Nome é obrigatório"
      });
    }

    if (!emailNormalizado || !/.+@.+\..+/.test(emailNormalizado)) {
      return res.status(400).json({
        message: "E-mail válido é obrigatório"
      });
    }

    if (genero !== undefined && genero !== null && !GENEROS_VALIDOS.includes(genero)) {
      return res.status(400).json({
        message: `genero precisa ser um de: ${GENEROS_VALIDOS.join(", ")}`
      });
    }

    const fotoUrl = req.file
      ? await uploadImage(req.file.buffer, "usuarios")
      : null;

    const { rows: usuarios } = await pool.query(
      `
      UPDATE usuarios
      SET
        nome = $1,
        telefone = $2,
        email = $3,
        genero = COALESCE($4, genero),
        foto_url = COALESCE($5, foto_url)
      WHERE id = $6
      RETURNING id, nome, email, telefone, foto_url, tipo, genero, preferencias_definidas
      `,
      [nome.trim(), emailNormalizado, telefone || null, genero || null, fotoUrl, req.user.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.json({
      message: "Perfil atualizado",
      user: usuarios[0]
    });

  } catch (error) {

    if (error.code === "23505") {
      return res.status(409).json({ message: "E-mail já cadastrado" });
    }

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

// ===== Preferências de estilo (onboarding) =====

exports.getPreferences = async (req, res) => {

  try {

    const { rows: estilos } = await pool.query(
      `
      SELECT e.id, e.nome
      FROM usuario_estilos_preferidos uep
      JOIN estilos e ON e.id = uep.estilo_id
      WHERE uep.usuario_id = $1
      ORDER BY e.nome
      `,
      [req.user.id]
    );

    return res.json({ estilos });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.setPreferences = async (req, res) => {

  try {

    const { style_ids } = req.body;

    if (!Array.isArray(style_ids)) {
      return res.status(400).json({
        message: "style_ids precisa ser uma lista"
      });
    }

    await pool.query(
      "DELETE FROM usuario_estilos_preferidos WHERE usuario_id = $1",
      [req.user.id]
    );

    for (const styleId of style_ids) {
      await pool.query(
        `
        INSERT INTO usuario_estilos_preferidos (usuario_id, estilo_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        `,
        [req.user.id, Number(styleId)]
      );
    }

    await pool.query(
      "UPDATE usuarios SET preferencias_definidas = TRUE WHERE id = $1",
      [req.user.id]
    );

    return res.json({
      message: "Preferências salvas"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

// ===== Confirmação de senha pra ações críticas (admin) =====
// Em vez de uma senha administrativa separada (mais um segredo
// pra vazar/gerenciar), reautentica com a PRÓPRIA senha da conta
// logada — identifica quem confirmou, sem criar segredo novo.
exports.confirmPassword = async (req, res) => {

  try {

    const { senha } = req.body;

    if (!senha) {
      return res.status(400).json({
        message: "Senha é obrigatória"
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

    const valida = await bcrypt.compare(senha, usuarios[0].senha);

    if (!valida) {
      return res.status(401).json({
        confirmado: false,
        message: "Senha incorreta"
      });
    }

    return res.json({
      confirmado: true
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};
