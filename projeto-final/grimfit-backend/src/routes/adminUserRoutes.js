const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const confirmarSenha = require("../middleware/confirmarSenha");

const {
  getUsers,
  updateUserType,
  deleteUser
} = require("../controllers/adminUserController");

router.get(
  "/",
  auth,
  admin,
  getUsers
);

router.put(
  "/:id",
  auth,
  admin,
  confirmarSenha,
  updateUserType
);

router.delete(
  "/:id",
  auth,
  admin,
  confirmarSenha,
  deleteUser
);

module.exports = router;
