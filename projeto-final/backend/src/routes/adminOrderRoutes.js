const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
  getOrders,
  updateStatus
} = require("../controllers/adminOrderController");

router.get(
  "/",
  auth,
  admin,
  getOrders
);

router.put(
  "/:id",
  auth,
  admin,
  updateStatus
);

module.exports = router;