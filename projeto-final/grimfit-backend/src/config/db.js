const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;

pool.connect()
  .then((client) => {
    console.log("POSTGRES CONECTADO");
    client.release();
  })
  .catch((err) => console.log("ERRO POSTGRES:", err.message));