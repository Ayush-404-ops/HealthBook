const express = require('express');
const router = express.Router();
const { getAllDoctors, approveDoctor, rejectDoctor, getStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/doctors', getAllDoctors);
router.put('/doctors/:id/approve', approveDoctor);
router.put('/doctors/:id/reject', rejectDoctor);
router.get('/stats', getStats);

module.exports = router;
