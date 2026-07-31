const bcrypt = require("bcryptjs");
const pool = require("../config/db");

// Exige que o admin confirme a PRÓPRIA senha (não uma senha
// administrativa separada) antes de executar a ação. Precisa
// vir no corpo da requisição como `confirmacao_senha`.
module.exports = async function exigirConfirmacaoSenha(req, res, next) {

  const senha = req.body?.confirmacao_senha;

  if (!senha) {
    return res.status(400).json({
      message: "Confirme sua senha pra executar essa ação"
    });
  }

  try {

    const { rows } = await pool.query(
      "SELECT senha FROM usuarios WHERE id = $1",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Usuário não encontrado"
      });
    }

    const valida = await bcrypt.compare(senha, rows[0].senha);

    if (!valida) {
      return res.status(401).json({
        message: "Senha incorreta"
      });
    }

    next();

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};
