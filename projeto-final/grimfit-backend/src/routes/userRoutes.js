const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const upload = require("../uploads/multer");

const {
  profile,
  updateProfile,
  changePassword,
  getPreferences,
  setPreferences,
  confirmPassword
} = require("../controllers/userController");

router.get("/profile", auth, profile);

router.put("/profile", auth, upload.single("foto"), updateProfile);

router.put("/password", auth, changePassword);

router.get("/preferences", auth, getPreferences);

router.put("/preferences", auth, setPreferences);

router.post("/confirm-password", auth, confirmPassword);

module.exports = router;
