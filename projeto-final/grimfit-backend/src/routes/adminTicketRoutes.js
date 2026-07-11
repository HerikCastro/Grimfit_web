const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const staff = require("../middleware/staff");

const {
  getTickets
} = require("../controllers/adminTicketController");

router.get(
  "/",
  auth,
  staff,
  getTickets
);

module.exports = router;