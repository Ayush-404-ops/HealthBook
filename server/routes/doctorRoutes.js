const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  getAvailableSlots,
  updateDoctorProfile,
  getMyDoctorProfile,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getDoctors);
router.get('/:id/slots', getAvailableSlots);
router.get('/:id', getDoctorById);

// Doctor-only routes
router.get('/me/profile', protect, authorize('doctor'), getMyDoctorProfile);
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);

module.exports = router;
