const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const uploadImage = require("../utils/uploadImage");

exports.profile = async (req, res) => {

  try {

    const { rows: user } =
      await pool.query(
        `
        SELECT
        id,
        nome AS "name",
        email,
        telefone AS "phone",
        foto_url AS "imageUrl",
        tipo AS "role",
        genero AS "gender",
        preferencias_definidas AS "preferencesDefined"
        FROM usuarios
        WHERE id = $1
        `,
        [req.user.id]
      );

    return res.json(
      user[0]
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

    const { name, email, phone, gender } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Nome é obrigatório"
      });
    }

    if (!normalizedEmail || !/.+@.+\..+/.test(normalizedEmail)) {
      return res.status(400).json({
        message: "E-mail válido é obrigatório"
      });
    }

    if (gender !== undefined && gender !== null && !GENEROS_VALIDOS.includes(gender)) {
      return res.status(400).json({
        message: `genero precisa ser um de: ${GENEROS_VALIDOS.join(", ")}`
      });
    }

    let imageUrl = null;
    if (req.file) {
      if (!req.file.buffer || req.file.buffer.length === 0) {
        throw new Error("Avatar upload did not contain image data");
      }
      imageUrl = await uploadImage(req.file.buffer, "usuarios");
    }

    const { rows: users } = await pool.query(
      `
      UPDATE usuarios
      SET
        nome = $1,
        telefone = $2,
        email = $3,
        genero = COALESCE($4, genero),
        foto_url = COALESCE($5, foto_url)
      WHERE id = $6
      RETURNING id, nome AS "name", email, telefone AS "phone", foto_url AS "imageUrl",
        tipo AS "role", genero AS "gender", preferencias_definidas AS "preferencesDefined"
      `,
      [name.trim(), normalizedEmail, phone || null, gender || null, imageUrl, req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.json({
      message: "Perfil atualizado",
      user: users[0]
    });

  } catch (error) {

    if (error.code === "23505") {
      return res.status(409).json({ message: "E-mail já cadastrado" });
    }

    console.error("Profile update failed:", error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.changePassword = async (req, res) => {

  try {

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: "currentPassword e newPassword (mín. 6 caracteres) são obrigatórios"
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

      const passwordValid = await bcrypt.compare(
        currentPassword,
      usuarios[0].senha
    );

      if (!passwordValid) {
      return res.status(400).json({
        message: "Senha atual incorreta"
      });
    }

    const hash = await bcrypt.hash(newPassword, 10);

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

    const { rows: styles } = await pool.query(
      `
      SELECT e.id, e.nome
      FROM usuario_estilos_preferidos uep
      JOIN estilos e ON e.id = uep.estilo_id
      WHERE uep.usuario_id = $1
      ORDER BY e.nome
      `,
      [req.user.id]
    );

    return res.json({ styles });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.setPreferences = async (req, res) => {
  const client = await pool.connect();

  try {

    const { styleIds } = req.body;

    if (!Array.isArray(styleIds)) {
      return res.status(400).json({
        message: "styleIds precisa ser uma lista"
      });
    }

    await client.query("BEGIN");

    await client.query(
      "DELETE FROM usuario_estilos_preferidos WHERE usuario_id = $1",
      [req.user.id]
    );

    for (const styleId of styleIds) {
      await client.query(
        `
        INSERT INTO usuario_estilos_preferidos (usuario_id, estilo_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        `,
        [req.user.id, Number(styleId)]
      );
    }

    await client.query(
      "UPDATE usuarios SET preferencias_definidas = TRUE WHERE id = $1",
      [req.user.id]
    );

    await client.query("COMMIT");

    return res.json({
      message: "Preferências salvas"
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  } finally {
    client.release();
  }

};

// ===== Confirmação de senha pra ações críticas (admin) =====
// Em vez de uma senha administrativa separada (mais um segredo
// pra vazar/gerenciar), reautentica com a PRÓPRIA senha da conta
// logada — identifica quem confirmou, sem criar segredo novo.
exports.confirmPassword = async (req, res) => {

  try {

    const { password } = req.body;

    if (!password) {
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

    const passwordValid = await bcrypt.compare(password, usuarios[0].senha);

    if (!passwordValid) {
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
