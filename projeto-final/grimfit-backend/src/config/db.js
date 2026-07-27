const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const ensureImageColumns = async () => {
  const statements = [
    "ALTER TABLE categorias ADD COLUMN IF NOT EXISTS imagem_url TEXT",
    "ALTER TABLE marcas ADD COLUMN IF NOT EXISTS imagem_url TEXT",
    "ALTER TABLE produtos ADD COLUMN IF NOT EXISTS imagem_url TEXT"
  ];

  for (const statement of statements) {
    try {
      await pool.query(statement);
    } catch (error) {
      console.log("ERRO AO GARANTIR COLUNA DE IMAGEM:", error.message);
    }
  }
};

module.exports = pool;

pool.connect()
  .then(async (client) => {
    console.log("POSTGRES CONECTADO");
    client.release();
    await ensureImageColumns();
  })
  .catch((err) => console.log("ERRO POSTGRES:", err.message));