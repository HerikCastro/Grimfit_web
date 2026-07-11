const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  addFavorite,
  removeFavorite,
  getFavorites
} = require("../controllers/favoriteController");

router.get("/", auth, getFavorites);

router.post("/", auth, addFavorite);

router.delete("/:id", auth, removeFavorite);

module.exports = router;