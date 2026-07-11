const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

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
  createProduct
);

router.delete(
  "/:id",
  auth,
  admin,
  deleteProduct
);

router.put(
  "/:id",
  auth,
  admin,
  updateProduct
);

module.exports = router;