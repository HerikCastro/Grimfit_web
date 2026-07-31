const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../uploads/multer");
const confirmarSenha = require("../middleware/confirmarSenha");

const {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProduct
} = require("../controllers/productController");

router.get("/", getProducts);

router.get("/:id", getProductById);

router.post(
  "/",
  auth,
  admin,
  upload.single("imagem"),
  createProduct
);

router.delete(
  "/:id",
  auth,
  admin,
  confirmarSenha,
  deleteProduct
);

router.put(
  "/:id",
  auth,
  admin,
  upload.single("imagem"),
  updateProduct
);

module.exports = router;
