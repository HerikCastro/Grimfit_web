const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  createTicket,
  getMyTickets,
  getTicketById
} = require("../controllers/ticketController");

const {
  getMessages,
  createMessage
} = require("../controllers/ticketMessageController");

router.post("/", auth, createTicket);

router.get("/", auth, getMyTickets);

router.get("/:id", auth, getTicketById);

router.get("/:ticketId/messages", auth, getMessages);

router.post("/:ticketId/messages", auth, createMessage);

module.exports = router;
