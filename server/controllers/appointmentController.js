const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { processRefund } = require('./paymentController');
const { eventBus, EVENTS } = require('../utils/events');
const { isSlotHeld, createHold, releaseHold, convertHold } = require('../services/holds');


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

    if (isSlotHeld(doctorId, date, startTime, req.user._id)) {
      return res.status(409).json({
        success: false,
        message: 'Slot is temporarily held by another patient. Please choose another or try again shortly.',
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

    if (req.body.holdId) {
      convertHold(req.body.holdId);
    }

    eventBus.publish(EVENTS.APPOINTMENT_CREATED, {
      appointmentId: appointment._id,
      patientId: req.user._id,
      doctorId,
      date,
      startTime,
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

    eventBus.publish(EVENTS.APPOINTMENT_CANCELLED, {
      appointmentId: appointment._id,
      patientId: req.user._id,
      doctorId: appointment.doctor,
      date: appointment.date,
      startTime: appointment.startTime,
    });

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

    eventBus.publish(EVENTS.APPOINTMENT_STATUS, {
      appointmentId: appointment._id,
      status,
      doctorId: doctorProfile._id,
      patientId: appointment.patient,
    });

    res.json({ success: true, message: `Appointment marked as ${status}`, data: appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
  }
};

// POST /api/appointments/hold  – hold a slot for booking
exports.holdSlot = async (req, res) => {
  try {
    const { doctorId, date, startTime, ttlMinutes = 5 } = req.body;
    if (!doctorId || !date || !startTime) {
      return res.status(400).json({ success: false, message: 'doctorId, date, and startTime are required' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isApproved) {
      return res.status(404).json({ success: false, message: 'Doctor not found or not approved' });
    }

    const existing = await Appointment.findOne({
      doctor: doctorId,
      date,
      startTime,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Slot is already booked' });
    }

    const hold = createHold({
      doctorId,
      date,
      startTime,
      patientId: req.user._id,
      ttlMinutes,
    });

    res.status(200).json({ success: true, data: hold });
  } catch (err) {
    if (err.statusCode === 409) {
      return res.status(409).json({ success: false, message: err.message });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/appointments/release-hold  – release held slot
exports.releaseHeldSlot = async (req, res) => {
  try {
    const { holdId } = req.body;
    if (!holdId) {
      return res.status(400).json({ success: false, message: 'holdId is required' });
    }
    const released = releaseHold(holdId);
    res.status(200).json({ success: true, released });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PATCH /api/appointments/:id/reschedule  – reschedule an appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { date, startTime } = req.body;
    if (!date || !startTime) {
      return res.status(400).json({ success: false, message: 'New date and startTime are required' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const isPatient = String(appointment.patient) === String(req.user._id);
    let isDoctor = false;
    if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (doctorProfile && String(doctorProfile._id) === String(appointment.doctor)) {
        isDoctor = true;
      }
    }

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to reschedule this appointment' });
    }

    if (['cancelled', 'completed'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: `Cannot reschedule a ${appointment.status} appointment` });
    }

    if ((appointment.rescheduleCount || 0) >= 2) {
      return res.status(400).json({
        success: false,
        message: 'Maximum reschedule limit reached (maximum 2 reschedules per appointment).',
      });
    }

    // 2-hour cutoff check
    const [curY, curM, curD] = appointment.date.split('-').map(Number);
    const [curH, curMin] = appointment.startTime.split(':').map(Number);
    const apptDateTime = new Date(curY, curM - 1, curD, curH, curMin);
    const now = new Date();
    const diffHours = (apptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours < 2) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule within 2 hours of the appointment time.',
      });
    }

    const conflict = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctor: appointment.doctor,
      date,
      startTime,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (conflict) {
      return res.status(409).json({ success: false, message: 'The requested slot is already booked' });
    }

    if (isSlotHeld(appointment.doctor, date, startTime, appointment.patient)) {
      return res.status(409).json({ success: false, message: 'Slot is currently held by another patient' });
    }

    const previousDate = appointment.date;
    const previousTime = appointment.startTime;

    appointment.date = date;
    appointment.startTime = startTime;
    appointment.rescheduleCount = (appointment.rescheduleCount || 0) + 1;
    await appointment.save();

    eventBus.publish(EVENTS.APPOINTMENT_RESCHEDULED, {
      appointmentId: appointment._id,
      doctorId: appointment.doctor,
      patientId: appointment.patient,
      previousDate,
      previousTime,
      newDate: date,
      newTime: startTime,
    });

    res.json({ success: true, message: 'Appointment rescheduled successfully', data: appointment });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Slot already booked' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PATCH /api/appointments/:id/consultation  – doctor saves notes and prescription
exports.saveConsultation = async (req, res) => {
  try {
    const { consultationNotes, prescription } = req.body;
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

    appointment.consultationNotes = consultationNotes || '';
    appointment.prescription = prescription || '';
    await appointment.save();

    res.json({ success: true, message: 'Consultation saved successfully', data: appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/appointments/:id/prescription  – printable or downloadable prescription
exports.getPrescription = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } })
      .populate('patient', 'name email phone');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const isPatient = String(appointment.patient._id || appointment.patient) === String(req.user._id);
    let isDoctor = false;
    if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (doctorProfile && String(doctorProfile._id) === String(appointment.doctor._id || appointment.doctor)) {
        isDoctor = true;
      }
    }

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this prescription' });
    }

    if (req.query.download === 'true') {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="prescription-${appointment._id}.txt"`);
      const content = `HEALTHBOOK MEDICAL PRESCRIPTION\n` +
        `----------------------------------------\n` +
        `Appointment ID: ${appointment._id}\n` +
        `Date: ${appointment.date} at ${appointment.startTime}\n` +
        `Doctor: Dr. ${appointment.doctor?.user?.name || 'Practitioner'}\n` +
        `Patient: ${appointment.patient?.name || 'Patient'}\n\n` +
        `CONSULTATION NOTES:\n${appointment.consultationNotes || 'None'}\n\n` +
        `RX / PRESCRIPTION:\n${appointment.prescription || 'No medicines prescribed.'}\n` +
        `----------------------------------------\n`;
      return res.send(content);
    }

    res.json({
      success: true,
      data: {
        appointmentId: appointment._id,
        doctorName: appointment.doctor?.user?.name,
        patientName: appointment.patient?.name,
        date: appointment.date,
        startTime: appointment.startTime,
        consultationNotes: appointment.consultationNotes,
        prescription: appointment.prescription,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


