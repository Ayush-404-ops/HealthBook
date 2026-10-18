const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const {
  uploadRecord,
  getMyRecords,
  getRecordById,
  deleteRecord,
} = require('../controllers/recordController');
const { protect } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `record-${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg']);
const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg']);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(file.mimetype)) {
    const error = new Error('Invalid file type. Only PDF, PNG, and JPEG documents are permitted.');
    error.statusCode = 400;
    return cb(error, false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter,
});

router.use(protect);

router.post('/upload', upload.single('file'), uploadRecord);
router.get('/mine', getMyRecords);
router.get('/:id', getRecordById);
router.delete('/:id', deleteRecord);

module.exports = router;
