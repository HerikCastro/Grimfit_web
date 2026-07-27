const rateLimit = require("express-rate-limit");
const { logBloqueio } = require("../utils/securityLogger");

function handlerBloqueado(req, res, _next, options) {

  logBloqueio({
    tipo: "rate_limit",
    ip: req.ip,
    metodo: req.method,
    rota: req.originalUrl,
    motivo: "Excedeu o limite de requisições",
    detalhe: `Limite: ${options.max} a cada ${options.windowMs / 1000}s`
  });

  return res.status(429).json({
    message: "Muitas requisições. Tenta de novo em alguns minutos."
  });

}

// Limite geral, pra qualquer rota — protege contra abuso/scraping
// básico sem incomodar navegação normal.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handlerBloqueado
});

// Limite bem mais apertado pra rotas sensíveis (login, registro,
// esqueci senha) — dificulta ataque de força bruta de senha.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handlerBloqueado
});

module.exports = { generalLimiter, authLimiter };