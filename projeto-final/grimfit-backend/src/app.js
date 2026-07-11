require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
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
const migrar = require("../migrate");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

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

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
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
app.use("/api/password", passwordRoutes);

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

app.get("/rodar-migracao-9x7k2", async (req, res) => {
  if (req.query.chave !== process.env.MIGRATION_KEY) {
    return res.status(403).json({ message: "Não autorizado" });
  }

  try {
    await migrar();
    return res.json({ message: "Migração concluída" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erro na migração", detalhe: error.message });
  }
});

module.exports = app;
