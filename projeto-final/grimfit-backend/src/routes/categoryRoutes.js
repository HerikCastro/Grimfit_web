const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../uploads/multer");

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");

router.get("/", getCategories);

router.get("/:id", getCategoryById);

router.post(
  "/",
  auth,
  admin,
  upload.single("imagem"),
  createCategory
);

router.put(
  "/:id",
  auth,
  admin,
  upload.single("imagem"),
  updateCategory
);

router.delete(
  "/:id",
  auth,
  admin,
  deleteCategory
);

module.exports = router;
