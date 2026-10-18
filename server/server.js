require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const path = require('path');

// Route imports
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const aiRoutes = require('./routes/aiRoutes');
const eventRoutes = require('./routes/eventRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const recordRoutes = require('./routes/recordRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { startScheduler } = require('./scheduler');

const app = express();


// ─── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/notifications', notificationRoutes);


// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  const status = err.statusCode || err.status || 500;
  const message = status === 500
    ? 'Internal server error. Please try again later.'
    : (err.message || 'Something went wrong');

  res.status(status).json({
    success: false,
    message,
  });
});

// ─── DB + Server Start ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthbook';

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set. Copy server/.env.example to server/.env and fill it in.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ MongoDB connected');
    startScheduler();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);

      // ── Configuration warnings ──────────────────────────────────
      const warnings = [];
      if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('xxxx')) {
        warnings.push('RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET — payments will fail');
      }
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('your_gemini')) {
        warnings.push('GEMINI_API_KEY — AI navigator will use keyword fallback only');
      }
      if (warnings.length > 0) {
        console.warn('');
        console.warn('⚠️  The following .env keys are still set to placeholder values:');
        warnings.forEach((w) => console.warn(`   • ${w}`));
        console.warn('   Update server/.env with real keys to enable these features.');
        console.warn('');
      }
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message || err);
    process.exit(1);
  });

module.exports = app;

