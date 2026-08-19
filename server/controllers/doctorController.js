const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

/**
 * Helper: generate time slots for a given startTime, endTime and duration in minutes.
 * e.g. "09:00", "12:00", 30 → ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]
 */
const generateSlots = (startTime, endTime, durationMinutes) => {
  const slots = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current + durationMinutes <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    current += durationMinutes;
  }

  return slots;
};

// GET /api/doctors  – list all approved doctors (with optional filters)
exports.getDoctors = async (req, res) => {
  try {
    const { specialty, name, minFee, maxFee } = req.query;

    const filter = { isApproved: true };
    if (specialty) filter.specialty = { $regex: specialty, $options: 'i' };
    if (minFee || maxFee) {
      filter.fee = {};
      if (minFee) filter.fee.$gte = Number(minFee);
      if (maxFee) filter.fee.$lte = Number(maxFee);
    }

    let doctors = await Doctor.find(filter).populate('user', 'name email phone');

    if (name) {
      doctors = doctors.filter((d) =>
        d.user.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/:id  – single doctor profile
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email phone');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, data: doctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/:id/slots?date=YYYY-MM-DD  – compute open slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'date query param is required (YYYY-MM-DD)' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    if (!doctor.isApproved) {
      return res.status(403).json({ success: false, message: 'Doctor is not approved' });
    }

    // Get weekday name from date string (treat as local date)
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekday = weekdays[dateObj.getDay()];

    const rule = doctor.availability.find((r) => r.day === weekday);
    if (!rule) {
      return res.json({ success: true, data: [], message: `Doctor is not available on ${weekday}` });
    }

    // Build candidate slots
    const candidates = generateSlots(rule.startTime, rule.endTime, doctor.slotDurationMinutes);

    // Fetch already booked slots for that date
    const booked = await Appointment.find({
      doctor: doctor._id,
      date,
      status: { $in: ['pending', 'confirmed'] },
    }).select('startTime');

    const bookedTimes = new Set(booked.map((a) => a.startTime));

    const available = candidates.filter((t) => !bookedTimes.has(t));

    res.json({ success: true, data: available, weekday });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/doctors/profile  – doctor updates their own profile (protected, doctor role)
exports.updateDoctorProfile = async (req, res) => {
  try {
    const { specialty, fee, bio, experienceYears, slotDurationMinutes, availability } = req.body;

    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      { specialty, fee, bio, experienceYears, slotDurationMinutes, availability },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    res.json({ success: true, data: doctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/me  – doctor views their own profile
exports.getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate('user', 'name email phone');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }
    res.json({ success: true, data: doctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
