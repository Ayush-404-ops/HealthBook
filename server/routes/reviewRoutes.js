const express = require('express');
const router = express.Router();
const {
  createReview,
  getDoctorReviews,
  getMyReviews,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/doctor/:doctorId', getDoctorReviews);
router.post('/', protect, authorize('patient'), createReview);
router.get('/mine', protect, authorize('patient'), getMyReviews);

module.exports = router;
