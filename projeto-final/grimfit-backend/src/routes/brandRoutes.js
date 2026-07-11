const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
  getBrands,
  createBrand,
  deleteBrand
} = require("../controllers/brandController");

router.get("/", getBrands);

router.post(
  "/",
  auth,
  admin,
  createBrand
);

router.delete(
  "/:id",
  auth,
  admin,
  deleteBrand
);

module.exports = router;