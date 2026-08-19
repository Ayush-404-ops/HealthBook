const express = require('express');
const router = express.Router();
const { navigate } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/navigate', protect, navigate);

module.exports = router;
