const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  profile,
  updateProfile,
  changePassword,
  getPreferencias,
  setPreferencias,
  confirmarSenha
} = require("../controllers/userController");

router.get("/profile", auth, profile);

router.put("/profile", auth, updateProfile);

router.put("/password", auth, changePassword);

router.get("/preferencias", auth, getPreferencias);

router.put("/preferencias", auth, setPreferencias);

router.post("/confirmar-senha", auth, confirmarSenha);

module.exports = router;
