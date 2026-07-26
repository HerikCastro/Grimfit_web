const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

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
  updateUserType
);

router.delete(
  "/:id",
  auth,
  admin,
  deleteUser
);

module.exports = router;
