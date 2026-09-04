const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const ConfirmPassword = require("../middleware/ConfirmPassword");
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
  upload.single("image"),
  createCategory
);

router.put(
  "/:id",
  auth,
  admin,
  upload.single("image"),
  updateCategory
);

router.delete(
  "/:id",
  auth,
  admin,
  ConfirmPassword,
  deleteCategory
);

module.exports = router;
