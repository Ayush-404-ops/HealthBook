const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, refundPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/create-order', authorize('patient'), createOrder);
router.post('/verify', authorize('patient'), verifyPayment);
router.post('/refund', authorize('patient', 'doctor', 'admin'), refundPayment);

module.exports = router;
