const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
  dashboard
} = require("../controllers/dashboardController");

router.get(
  "/",
  auth,
  admin,
  dashboard
);

module.exports = router;