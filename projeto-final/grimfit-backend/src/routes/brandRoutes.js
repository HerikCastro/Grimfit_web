const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const ConfirmPassword = require("../middleware/ConfirmPassword");
const upload = require("../uploads/multer");

const {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
} = require("../controllers/brandController");

router.get("/", getBrands);

router.get("/:id", getBrandById);

router.post(
  "/",
  auth,
  admin,
  upload.single("imagem"),
  createBrand
);

router.put(
  "/:id",
  auth,
  admin,
  upload.single("imagem"),
  updateBrand
);

router.delete(
  "/:id",
  auth,
  admin,
  ConfirmPassword,
  deleteBrand
);

module.exports = router;
