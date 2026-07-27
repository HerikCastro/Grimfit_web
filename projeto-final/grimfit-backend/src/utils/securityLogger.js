const winston = require("winston");

// Loga em JSON estruturado (timestamp, nível, evento, dados) direto
// no console — o Render já captura a saída do console como log,
// então não precisa de nenhum serviço externo pra isso funcionar.
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

function logBloqueio({ tipo, ip, metodo, rota, motivo, detalhe }) {

  logger.warn("requisicao_bloqueada", {
    tipo,
    ip,
    metodo,
    rota,
    motivo,
    detalhe
  });

}

module.exports = { logger, logBloqueio };