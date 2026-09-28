const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Rate limiter for authentication routes: max 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
  },
});

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
