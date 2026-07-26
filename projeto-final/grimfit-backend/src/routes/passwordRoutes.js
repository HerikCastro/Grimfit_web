const express = require("express");

const router = express.Router();

const {
  forgotPassword,
  resetPassword
} = require("../controllers/passwordController");

router.post("/forgot", forgotPassword);

router.post("/reset", resetPassword);

module.exports = router;
