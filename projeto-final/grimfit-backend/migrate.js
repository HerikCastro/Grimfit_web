// Script de migração — roda o schema SQL uma única vez no banco.
// Depois de confirmar que funcionou, PODE apagar esse arquivo e a rota
// que chama ele (ver instruções no tutorial).

const fs = require("fs");
const path = require("path");
const pool = require("./src/config/db");

async function migrar() {
  const sql = fs.readFileSync(
    path.join(__dirname, "grimfit_postgres.sql"),
    "utf8"
  );

  await pool.query(sql);

  console.log("Migração concluída com sucesso!");
}

module.exports = migrar;
