const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
  getStyles,
  createStyle,
  updateStyle,
  deleteStyle
} = require("../controllers/styleController");

router.get("/", getStyles);
router.post("/", auth, admin, createStyle);
router.put("/:id", auth, admin, updateStyle);
router.delete("/:id", auth, admin, deleteStyle);

module.exports = router;
