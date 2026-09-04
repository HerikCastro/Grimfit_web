const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../uploads/multer");
const ConfirmPassword = require("../middleware/ConfirmPassword");

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
  upload.single("image"),
  createProduct
);

router.delete(
  "/:id",
  auth,
  admin,
  ConfirmPassword,
  deleteProduct
);

router.put(
  "/:id",
  auth,
  admin,
  upload.single("image"),
  updateProduct
);

module.exports = router;
