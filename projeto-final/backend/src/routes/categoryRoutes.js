const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
  getCategories,
  createCategory,
  deleteCategory
} = require("../controllers/categoryController");

router.get("/", getCategories);

router.post(
  "/",
  auth,
  admin,
  createCategory
);

router.delete(
  "/:id",
  auth,
  admin,
  deleteCategory
);

module.exports = router;