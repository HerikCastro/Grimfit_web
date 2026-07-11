const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
  getUsers
} = require("../controllers/adminUserController");

router.get(
  "/",
  auth,
  admin,
  getUsers
);

module.exports = router;