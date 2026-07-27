const { logBloqueio } = require("../utils/securityLogger");

// Padrões de ataque conhecidos. Não é um WAF de nível enterprise
// (esses usam listas bem mais sofisticadas, tipo o OWASP CRS), mas
// cobre as tentativas mais comuns e óbvias:
// SQL injection, XSS, path traversal e alguns comandos perigosos.
const PADROES_SUSPEITOS = [
  { nome: "sql_injection", regex: /(\bunion\b\s+\bselect\b)|(\bor\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+)|(\bdrop\b\s+\btable\b)|(--\s)|(\/\*.*\*\/)|(\bxp_cmdshell\b)|(';\s*--)/i },
  { nome: "xss", regex: /<script[\s>]|<iframe[\s>]|javascript:|on(error|load|click|mouseover)\s*=/i },
  { nome: "path_traversal", regex: /\.\.\/|\.\.\\/ },
  { nome: "nosql_injection", regex: /\$where\b|\$ne\b|\$gt\b|\$regex\b/i }
];

function contemPadraoSuspeito(valor) {

  if (typeof valor !== "string") {
    return null;
  }

  for (const padrao of PADROES_SUSPEITOS) {
    if (padrao.regex.test(valor)) {
      return padrao.nome;
    }
  }

  return null;

}

// Varre recursivamente objetos/arrays (body, query, params podem
// ter campos aninhados) procurando string suspeita em qualquer nível.
function varrer(objeto) {

  if (objeto === null || objeto === undefined) {
    return null;
  }

  if (typeof objeto === "string") {
    return contemPadraoSuspeito(objeto);
  }

  if (Array.isArray(objeto)) {
    for (const item of objeto) {
      const achado = varrer(item);
      if (achado) return achado;
    }
    return null;
  }

  if (typeof objeto === "object") {
    for (const chave of Object.keys(objeto)) {
      const achado = varrer(objeto[chave]);
      if (achado) return achado;
    }
    return null;
  }

  return null;

}

function waf(req, res, next) {

  const achadoBody = varrer(req.body);
  const achadoQuery = varrer(req.query);
  const achadoParams = varrer(req.params);

  const motivo = achadoBody || achadoQuery || achadoParams;

  if (motivo) {

    logBloqueio({
      tipo: "waf",
      ip: req.ip,
      metodo: req.method,
      rota: req.originalUrl,
      motivo,
      detalhe: "Padrão suspeito encontrado em body/query/params"
    });

    return res.status(403).json({
      message: "Requisição bloqueada por conter conteúdo suspeito"
    });

  }

  next();

}

module.exports = waf;