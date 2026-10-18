const fs = require('fs');
const path = require('path');
const MedicalRecord = require('../models/MedicalRecord');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
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

    // Auth check
    const isOwner = String(record.patient) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin' && req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Not authorized to access this record' });
    }

    res.json({ success: true, data: record });
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
