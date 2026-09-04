const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
  getVariantsByProduct,
  createVariant,
  updateVariant,
  deleteVariant
} = require("../controllers/variantController");

// Listar/criar variação de um produto específico
router.get("/product/:productId", getVariantsByProduct);

router.post(
  "/product/:productId",
  auth,
  admin,
  createVariant
);

// Editar/apagar uma variação pelo próprio id dela
router.put("/:id", auth, admin, updateVariant);

router.delete("/:id", auth, admin, deleteVariant);

module.exports = router;
