const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const { login, register, refreshTokenHandler, logout, me } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

// 10 attempts per 15 min per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
});

// 5 registrations per hour per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many registration attempts. Please try again later." },
});

// 30 refresh calls per 15 min
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many refresh attempts. Please log in again." },
});

router.post("/login", loginLimiter, login);
router.post("/register", registerLimiter, register);
router.post("/refresh", refreshLimiter, refreshTokenHandler);
router.post("/logout", logout);
router.get("/me", authenticate, me);

module.exports = router;
