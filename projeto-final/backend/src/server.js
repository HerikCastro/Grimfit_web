const app = require("./app");

const PORT = process.env.PORT || 28171;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});