const express = require('express');
const router = express.Router();
const { streamEvents } = require('../controllers/eventController');

// SSE stream endpoint
router.get('/stream', streamEvents);
router.get('/', streamEvents);

module.exports = router;
