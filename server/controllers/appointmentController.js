const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// POST /api/appointments  – patient books an appointment
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, startTime, notes } = req.body;

    if (!doctorId || !date || !startTime) {
      return res.status(400).json({ success: false, message: 'doctorId, date and startTime are required' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    if (!doctor.isApproved) return res.status(403).json({ success: false, message: 'Doctor is not approved yet' });

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date,
      startTime,
      notes: notes || '',
      status: 'pending',
      payment: { status: 'unpaid', amount: doctor.fee },
    });

    await appointment.populate([
      { path: 'doctor', populate: { path: 'user', select: 'name email' } },
      { path: 'patient', select: 'name email' },
    ]);

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    // Duplicate key → the slot was just taken
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'That slot was just taken. Please choose another.' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments/mine  – patient's own appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } })
      .sort({ date: 1, startTime: 1 });

    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments/doctor  – doctor's appointments
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ doctor: doctorProfile._id })
      .populate('patient', 'name email phone')
      .sort({ date: 1, startTime: 1 });

    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/appointments/:id/cancel  – patient cancels their own appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (['cancelled', 'completed'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${appointment.status} appointment` });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ success: true, data: appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/appointments/:id/status  – doctor updates appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: doctorProfile._id,
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ success: true, data: appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
