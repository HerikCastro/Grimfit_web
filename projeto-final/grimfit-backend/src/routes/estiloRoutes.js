const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
  getEstilos,
  createEstilo,
  updateEstilo,
  deleteEstilo
} = require("../controllers/estiloController");

router.get("/", getEstilos);

router.post("/", auth, admin, createEstilo);

router.put("/:id", auth, admin, updateEstilo);

router.delete("/:id", auth, admin, deleteEstilo);

module.exports = router;
