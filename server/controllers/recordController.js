const fs = require('fs');
const path = require('path');
const MedicalRecord = require('../models/MedicalRecord');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_SIGNATURES = {
  '.pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  '.png': [0x89, 0x50, 0x4E, 0x47],
  '.jpg': [0xFF, 0xD8, 0xFF],
  '.jpeg': [0xFF, 0xD8, 0xFF],
};

function verifyMagicBytes(filePath, ext) {
  const expected = ALLOWED_SIGNATURES[ext.toLowerCase()];
  if (!expected) return false;

  const buffer = Buffer.alloc(expected.length);
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buffer, 0, expected.length, 0);
  fs.closeSync(fd);

  for (let i = 0; i < expected.length; i++) {
    if (buffer[i] !== expected[i]) {
      return false;
    }
  }
  return true;
}

// POST /api/records/upload – upload a medical record document
exports.uploadRecord = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    const { title, description, doctorId } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    // Verify magic bytes (file signature) matches expected extension
    const ext = path.extname(req.file.originalname).toLowerCase();
    const filePath = req.file.path;
    if (!verifyMagicBytes(filePath, ext)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        // cleanup failed
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid file signature. File content does not match allowed format.',
      });
    }

    const record = await MedicalRecord.create({
      patient: req.user._id,
      doctor: doctorId || null,
      title: title.trim(),
      description: description ? description.trim() : '',
      fileUrl: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/records/mine – get patient's records
exports.getMyRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.user._id })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/records/:id – view record details
exports.getRecordById = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    // Auth check:
    // 1. Patient owner or Admin
    const isOwner = String(record.patient) === String(req.user._id);
    if (isOwner || req.user.role === 'admin') {
      return res.json({ success: true, data: record });
    }

    // 2. Doctor: can read only if they share a confirmed or completed appointment with this patient
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor) {
        return res.status(403).json({ success: false, message: 'Doctor profile not found' });
      }

      const hasSharedAppointment = await Appointment.findOne({
        doctor: doctor._id,
        patient: record.patient,
        status: { $in: ['confirmed', 'completed'] },
      });

      if (!hasSharedAppointment) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this record without a shared confirmed or completed appointment',
        });
      }

      return res.json({ success: true, data: record });
    }

    return res.status(403).json({ success: false, message: 'Not authorized to access this record' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/records/:id – delete a record
exports.deleteRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    // Try deleting physical file
    const filePath = path.join(uploadsDir, record.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        // file unlink warning
      }
    }

    await MedicalRecord.deleteOne({ _id: record._id });

    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
