const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

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
  createBrand
);

router.put(
  "/:id",
  auth,
  admin,
  updateBrand
);

router.delete(
  "/:id",
  auth,
  admin,
  deleteBrand
);

module.exports = router;
