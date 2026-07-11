module.exports = (
  req,
  res,
  next
) => {

  if (
    req.user.tipo !== "admin" &&
    req.user.tipo !== "suporte"
  ) {

    return res.status(403).json({
      message: "Acesso negado"
    });

  }

  next();

};