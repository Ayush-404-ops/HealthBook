const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { processRefund } = require('./paymentController');

// Status state machine definition
const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

// POST /api/appointments  – patient books an appointment
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, startTime, notes } = req.body;

    if (!doctorId || !date || !startTime) {
      return res.status(400).json({ success: false, message: 'doctorId, date and startTime are required' });
    }

    // ── Validate date format ────────────────────────────────────
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    // ── Reject past dates ───────────────────────────────────────
    const [year, month, day] = date.split('-').map(Number);
    const requestedDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestedDate < today) {
      return res.status(400).json({ success: false, message: 'Cannot book an appointment in the past.' });
    }

    // ── Validate startTime format ───────────────────────────────
    if (!/^\d{2}:\d{2}$/.test(startTime)) {
      return res.status(400).json({ success: false, message: 'Invalid startTime format. Use HH:MM.' });
    }

    // ── If booking today, reject times that have already passed ─
    const now = new Date();
    if (requestedDate.getTime() === today.getTime()) {
      const [slotH, slotM] = startTime.split(':').map(Number);
      const slotMinutes = slotH * 60 + slotM;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      if (slotMinutes <= nowMinutes) {
        return res.status(400).json({ success: false, message: 'Cannot book a time slot that has already passed today.' });
      }
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    if (!doctor.isApproved) return res.status(403).json({ success: false, message: 'Doctor is not approved yet' });

    // ── Check doctor works on the requested weekday ─────────────
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekday = weekdays[requestedDate.getDay()];
    const rule = doctor.availability.find((r) => r.day === weekday);

    if (!rule) {
      return res.status(400).json({
        success: false,
        message: `Doctor is not available on ${weekday}. Please choose another date.`,
      });
    }

    // ── Validate startTime is a legitimate slot within the rule ──
    const generateSlots = (start, end, duration) => {
      const slots = [];
      const [sH, sM] = start.split(':').map(Number);
      const [eH, eM] = end.split(':').map(Number);
      let cur = sH * 60 + sM;
      const last = eH * 60 + eM;
      while (cur + duration <= last) {
        const h = Math.floor(cur / 60).toString().padStart(2, '0');
        const m = (cur % 60).toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
        cur += duration;
      }
      return slots;
    };

    const validSlots = generateSlots(rule.startTime, rule.endTime, doctor.slotDurationMinutes);
    if (!validSlots.includes(startTime)) {
      return res.status(400).json({
        success: false,
        message: `"${startTime}" is not a valid slot for this doctor on ${weekday}. Available windows: ${rule.startTime}–${rule.endTime} every ${doctor.slotDurationMinutes} min.`,
      });
    }

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
    res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
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
    res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
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
    res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
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

    // Process refund if payment was previously completed
    if (appointment.payment?.status === 'paid') {
      await processRefund(appointment);
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ success: true, message: 'Appointment cancelled successfully', data: appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
  }
};

// PATCH /api/appointments/:id/status  – doctor updates appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
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

    const currentStatus = appointment.status;

    // Disallow setting the same status
    if (status === currentStatus) {
      return res.status(400).json({ success: false, message: `Appointment is already ${currentStatus}` });
    }

    // Check if already in a terminal state
    if (['completed', 'cancelled'].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status of a ${currentStatus} appointment. It is in a final state.`,
      });
    }

    // Enforce allowed state transitions
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from "${currentStatus}" to "${status}".`,
      });
    }

    // Specific rule: Cannot complete unless confirmed AND paid
    if (status === 'completed') {
      if (currentStatus !== 'confirmed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot mark appointment as completed: appointment must be confirmed first.',
        });
      }
      if (appointment.payment?.status !== 'paid') {
        return res.status(400).json({
          success: false,
          message: 'Cannot mark appointment as completed: payment has not been received (unpaid).',
        });
      }
    }

    // If cancelling an appointment that was paid, process refund
    if (status === 'cancelled' && appointment.payment?.status === 'paid') {
      await processRefund(appointment);
    }

    appointment.status = status;
    await appointment.save();

    res.json({ success: true, message: `Appointment marked as ${status}`, data: appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
  }
};
