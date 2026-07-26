const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem
} = require("../controllers/cartController");

router.get("/", auth, getCart);

router.post("/", auth, addCartItem);

router.put("/:id", auth, updateCartItem);

router.delete("/:id", auth, removeCartItem);

module.exports = router;
