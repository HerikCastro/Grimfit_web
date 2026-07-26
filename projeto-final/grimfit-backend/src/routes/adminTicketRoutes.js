const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const staff = require("../middleware/staff");

const {
  getTickets,
  updateTicketStatus
} = require("../controllers/adminTicketController");

router.get(
  "/",
  auth,
  staff,
  getTickets
);

router.put(
  "/:id/status",
  auth,
  staff,
  updateTicketStatus
);

module.exports = router;
