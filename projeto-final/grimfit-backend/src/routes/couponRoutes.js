const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
} = require("../controllers/couponController");

router.post("/validate", validateCoupon);

router.get("/", auth, admin, getCoupons);

router.post("/", auth, admin, createCoupon);

router.put("/:id", auth, admin, updateCoupon);

router.delete("/:id", auth, admin, deleteCoupon);

module.exports = router;
