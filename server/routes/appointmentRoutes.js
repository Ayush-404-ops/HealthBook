const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  cancelAppointment,
  updateAppointmentStatus,
  holdSlot,
  releaseHeldSlot,
  rescheduleAppointment,
  saveConsultation,
  getPrescription,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // all appointment routes require auth

router.post('/', authorize('patient'), createAppointment);
router.post('/hold', authorize('patient'), holdSlot);
router.post('/release-hold', authorize('patient'), releaseHeldSlot);
router.get('/mine', authorize('patient'), getMyAppointments);
router.get('/doctor', authorize('doctor'), getDoctorAppointments);
router.patch('/:id/cancel', authorize('patient'), cancelAppointment);
router.patch('/:id/status', authorize('doctor'), updateAppointmentStatus);
router.patch('/:id/reschedule', rescheduleAppointment);
router.patch('/:id/consultation', authorize('doctor'), saveConsultation);
router.get('/:id/prescription', getPrescription);

module.exports = router;


