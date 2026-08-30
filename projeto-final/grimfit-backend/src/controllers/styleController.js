const pool = require("../config/db");

exports.getStyles = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM estilos ORDER BY nome");
    return res.json(rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  }
};

exports.createStyle = async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome || !nome.trim()) return res.status(400).json({ message: "Nome é obrigatório" });

    const { rows: [estilo] } = await pool.query(
      "INSERT INTO estilos(nome) VALUES($1) RETURNING id",
      [nome.trim()]
    );
    return res.status(201).json({ message: "Estilo criado", id: estilo.id });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ message: "Já existe um estilo com esse nome" });
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  }
};

exports.updateStyle = async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome || !nome.trim()) return res.status(400).json({ message: "Nome é obrigatório" });

    const { rowCount } = await pool.query(
      "UPDATE estilos SET nome = $1 WHERE id = $2",
      [nome.trim(), req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ message: "Estilo não encontrado" });
    return res.json({ message: "Estilo atualizado" });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ message: "Já existe um estilo com esse nome" });
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  }
};

exports.deleteStyle = async (req, res) => {
  const client = await pool.connect();
  try {
    const { rows: [count] } = await client.query(
      "SELECT COUNT(*) AS total FROM produto_estilos WHERE estilo_id = $1",
      [req.params.id]
    );
    const total = parseInt(count.total, 10);
    const force = req.query.force === "true";

    if (total > 0 && !force) {
      return res.status(409).json({
        message: `Esse estilo está associado a ${total} produto(s).`,
        total,
        pode_forcar: true
      });
    }

    await client.query("BEGIN");
    // ON DELETE CASCADE em produto_estilos já cuida disso, mas explicitando pra segurança
    await client.query("DELETE FROM produto_estilos WHERE estilo_id = $1", [req.params.id]);
    await client.query("DELETE FROM usuario_estilos_preferidos WHERE estilo_id = $1", [req.params.id]);

    const { rowCount } = await client.query("DELETE FROM estilos WHERE id = $1", [req.params.id]);
    if (rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Estilo não encontrado" });
    }

    await client.query("COMMIT");
    return res.json({ message: "Estilo removido" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  } finally {
    client.release();
  }
};
