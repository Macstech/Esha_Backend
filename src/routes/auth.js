const express = require("express");
const router = express.Router();
const { login, register, refreshTokenHandler, me } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

router.post("/login", login);
router.post("/register", register);
router.post("/refresh", refreshTokenHandler);
router.get("/me", authenticate, me);

module.exports = router;
