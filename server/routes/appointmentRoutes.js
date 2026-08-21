const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  cancelAppointment,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // all appointment routes require auth

router.post('/', authorize('patient'), createAppointment);
router.get('/mine', authorize('patient'), getMyAppointments);
router.get('/doctor', authorize('doctor'), getDoctorAppointments);
router.patch('/:id/cancel', authorize('patient'), cancelAppointment);
router.patch('/:id/status', authorize('doctor'), updateAppointmentStatus);

module.exports = router;
