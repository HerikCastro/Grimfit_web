const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  profile,
  updateProfile,
  changePassword
} = require("../controllers/userController");

router.get("/profile", auth, profile);

router.put("/profile", auth, updateProfile);

router.put("/password", auth, changePassword);

module.exports = router;
