const pool = require("../config/db");

exports.getEstilos = async (req, res) => {

  try {

    const { rows: estilos } = await pool.query(
      "SELECT * FROM estilos ORDER BY nome"
    );

    return res.json(estilos);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.createEstilo = async (req, res) => {

  try {

    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        message: "Nome é obrigatório"
      });
    }

    const { rows: [estilo] } = await pool.query(
      "INSERT INTO estilos(nome) VALUES($1) RETURNING id",
      [nome.trim()]
    );

    return res.status(201).json({
      message: "Estilo criado",
      id: estilo.id
    });

  } catch (error) {

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Já existe um estilo com esse nome"
      });
    }

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.updateEstilo = async (req, res) => {

  try {

    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        message: "Nome é obrigatório"
      });
    }

    const { rowCount } = await pool.query(
      "UPDATE estilos SET nome = $1 WHERE id = $2",
      [nome.trim(), req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Estilo não encontrado"
      });
    }

    return res.json({
      message: "Estilo atualizado"
    });

  } catch (error) {

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Já existe um estilo com esse nome"
      });
    }

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.deleteEstilo = async (req, res) => {

  try {

    const { rowCount } = await pool.query(
      "DELETE FROM estilos WHERE id = $1",
      [req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Estilo não encontrado"
      });
    }

    return res.json({
      message: "Estilo removido"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};
