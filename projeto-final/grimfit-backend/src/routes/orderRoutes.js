const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  createOrder,
  myOrders,
  cancelOrder
} = require("../controllers/orderController");

router.post("/", auth, createOrder);

router.get("/", auth, myOrders);

router.put("/:id/cancel", auth, cancelOrder);

module.exports = router;