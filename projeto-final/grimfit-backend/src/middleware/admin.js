module.exports = (req, res, next) => {
  if (req.user.tipo !== "admin") {
    return res.status(403).json({
      message: "Acesso negado"
    });
  }

  next();
};