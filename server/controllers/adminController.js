const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// GET /api/admin/doctors  – all doctors + approval status
exports.getAllDoctors = async (req, res) => {
  try {
    const { status } = req.query; // 'pending' | 'approved' | 'all'
    const filter = {};
    if (status === 'pending') filter.isApproved = false;
    else if (status === 'approved') filter.isApproved = true;

    const doctors = await Doctor.find(filter)
      .populate('user', 'name email phone createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/doctors/:id/approve
exports.approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('user', 'name email');

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    res.json({ success: true, message: 'Doctor approved', data: doctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/doctors/:id/reject
exports.rejectDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    ).populate('user', 'name email');

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    res.json({ success: true, message: 'Doctor rejected', data: doctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/stats  – platform-wide statistics
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalDoctors, totalAppointments, revenueResult] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Appointment.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$payment.amount' } } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totalPatients: totalUsers,
        totalDoctors,
        totalAppointments,
        totalRevenue,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
