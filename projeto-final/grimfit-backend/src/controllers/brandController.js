const pool = require("../config/db");
const uploadImage = require("../utils/uploadImage");

exports.getBrands = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM marcas ORDER BY nome");
    return res.json(rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  }
};

exports.getBrandById = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM marcas WHERE id = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Marca não encontrada" });
    return res.json(rows[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  }
};

exports.createBrand = async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome || !nome.trim()) return res.status(400).json({ message: "Nome é obrigatório" });
    if (!req.file) return res.status(400).json({ message: "Imagem é obrigatória" });

    const imagem_url = await uploadImage(req.file.buffer, "marcas");
    await pool.query("INSERT INTO marcas(nome, imagem_url) VALUES($1,$2)", [nome.trim(), imagem_url]);
    return res.status(201).json({ message: "Marca criada" });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ message: "Já existe uma marca com esse nome" });
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome || !nome.trim()) return res.status(400).json({ message: "Nome é obrigatório" });

    let imagem_url = null;
    if (req.file) imagem_url = await uploadImage(req.file.buffer, "marcas");

    const { rowCount } = await pool.query(
      "UPDATE marcas SET nome = $1, imagem_url = COALESCE($2, imagem_url) WHERE id = $3",
      [nome.trim(), imagem_url, req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ message: "Marca não encontrada" });
    return res.json({ message: "Marca atualizada" });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ message: "Já existe uma marca com esse nome" });
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  }
};

exports.deleteBrand = async (req, res) => {
  const client = await pool.connect();
  try {
    const { rows: prods } = await client.query(
      "SELECT COUNT(*) AS total FROM produtos WHERE marca_id = $1",
      [req.params.id]
    );
    const total = parseInt(prods[0].total, 10);
    const force = req.query.force === "true";

    if (total > 0 && !force) {
      return res.status(409).json({
        message: `Existem ${total} produto(s) usando essa marca.`,
        total,
        pode_forcar: true
      });
    }

    await client.query("BEGIN");

    if (total > 0 && force) {
      await client.query("UPDATE produtos SET marca_id = NULL WHERE marca_id = $1", [req.params.id]);
    }

    const { rowCount } = await client.query("DELETE FROM marcas WHERE id = $1", [req.params.id]);
    if (rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Marca não encontrada" });
    }

    await client.query("COMMIT");
    return res.json({ message: "Marca removida" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    return res.status(500).json({ message: "Erro interno" });
  } finally {
    client.release();
  }
};
