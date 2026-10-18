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

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

router.use(protect);

router.post('/upload', upload.single('file'), uploadRecord);
router.get('/mine', getMyRecords);
router.get('/:id', getRecordById);
router.delete('/:id', deleteRecord);

module.exports = router;
