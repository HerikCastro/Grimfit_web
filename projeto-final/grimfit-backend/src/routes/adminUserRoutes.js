const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const ConfirmPassword = require("../middleware/ConfirmPassword");

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
  ConfirmPassword,
  updateUserType
);

router.delete(
  "/:id",
  auth,
  admin,
  ConfirmPassword,
  deleteUser
);

module.exports = router;
