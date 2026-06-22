const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  createTicket,
  getMyTickets
} = require("../controllers/ticketController");

router.post("/", auth, createTicket);

router.get("/", auth, getMyTickets);

module.exports = router;