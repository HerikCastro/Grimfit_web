const pool = require("../config/db");
const uploadImage = require("../utils/uploadImage");

exports.getCategories = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM categorias ORDER BY nome");
    return res.json(rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM categorias WHERE id = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Categoria não encontrada" });
    return res.json(rows[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome || !nome.trim()) return res.status(400).json({ message: "Nome é obrigatório" });
    const imageUrl = req.file
      ? await uploadImage(req.file.buffer, "categorias")
      : null;

    await pool.query(
      "INSERT INTO categorias(nome, imagem_url) VALUES($1,$2)",
      [nome.trim(), imageUrl]
    );
    return res.status(201).json({ message: "Categoria criada" });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ message: "Já existe uma categoria com esse nome" });
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome || !nome.trim()) return res.status(400).json({ message: "Nome é obrigatório" });

    let imageUrl = null;
    if (req.file) imageUrl = await uploadImage(req.file.buffer, "categorias");

    const { rowCount } = await pool.query(
      `UPDATE categorias
       SET nome = $1, imagem_url = COALESCE($2, imagem_url)
       WHERE id = $3`,
      [nome.trim(), imageUrl, req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ message: "Categoria não encontrada" });
    return res.json({ message: "Categoria atualizada" });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ message: "Já existe uma categoria com esse nome" });
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  }
};

exports.deleteCategory = async (req, res) => {
  const client = await pool.connect();
  try {
    // Verifica se há produtos nessa categoria
    const { rows: prods } = await client.query(
      "SELECT COUNT(*) AS total FROM produtos WHERE categoria_id = $1",
      [req.params.id]
    );
    const total = parseInt(prods[0].total, 10);

    // force=true permite apagar mesmo com produtos (seta categoria_id = NULL neles)
    const force = req.query.force === "true";

    if (total > 0 && !force) {
      return res.status(409).json({
        message: `Existem ${total} produto(s) nessa categoria.`,
        total,
        pode_forcar: true
      });
    }

    await client.query("BEGIN");

    // Se force, desvincula os produtos em vez de apagá-los
    if (total > 0 && force) {
      await client.query(
        "UPDATE produtos SET categoria_id = NULL WHERE categoria_id = $1",
        [req.params.id]
      );
    }

    const { rowCount } = await client.query(
      "DELETE FROM categorias WHERE id = $1",
      [req.params.id]
    );
    if (rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Categoria não encontrada" });
    }

    await client.query("COMMIT");
    return res.json({ message: "Categoria removida" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  } finally {
    client.release();
  }
};
