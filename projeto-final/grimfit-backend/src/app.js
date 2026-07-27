require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const pool = require("./config/db");
const waf = require("./middleware/waf");
const { generalLimiter, authLimiter } = require("./middleware/rateLimiter");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const variantRoutes = require("./routes/variantRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const brandRoutes = require("./routes/brandRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const addressRoutes = require("./routes/addressRoutes");
const couponRoutes = require("./routes/couponRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const adminTicketRoutes = require("./routes/adminTicketRoutes");
const passwordRoutes = require("./routes/passwordRoutes");

const app = express();

// O Render fica atrás de um proxy reverso — sem isso, req.ip sempre
// mostraria o IP interno do proxy, não o IP real de quem acessa.
// Isso quebraria o rate limit (todo mundo pareceria o "mesmo" IP).
app.set("trust proxy", 1);

app.use(cors());
app.use(helmet());
app.use(express.json());

// Rate limit geral pra tudo, e o WAF analisa o conteúdo de toda
// requisição já com o body parseado (por isso vem depois do
// express.json()).
app.use(generalLimiter);
app.use(waf);

app.get("/", (req, res) => {
  res.json({
    projeto: "GrimFit",
    status: "online"
  });
});

app.get("/db-test", async (req, res) => {
  try {

    await pool.query("SELECT 1");

    return res.json({
      database: "conectado"
    });

  } catch {

    return res.status(500).json({
      database: "erro"
    });

  }
});

// authLimiter é mais rígido que o geral — protege login/registro/
// reset de senha contra tentativa de força bruta.
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/password", authLimiter, passwordRoutes);

app.use("/api/products", productRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/tickets", adminTicketRoutes);

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// Erros do multer (arquivo grande demais, tipo inválido) e outros
// erros passados via next(err) caem aqui — sem isso, o Express
// devolvia uma página de erro HTML em vez de JSON.
app.use((err, req, res, next) => {

  if (err && err.name === "MulterError") {
    return res.status(400).json({
      message: `Erro no upload: ${err.message}`
    });
  }

  if (err) {
    console.log(err);
    return res.status(400).json({
      message: err.message || "Erro na requisição"
    });
  }

  next();

});

module.exports = app;