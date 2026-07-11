const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  getCart,
  addCartItem,
  removeCartItem
} = require("../controllers/cartController");

router.get("/", auth, getCart);

router.post("/", auth, addCartItem);

router.delete("/:id", auth, removeCartItem);

module.exports = router;