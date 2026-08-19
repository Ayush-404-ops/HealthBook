const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    date: {
      type: String, // "2026-08-20"  (YYYY-MM-DD)
      required: true,
    },
    startTime: {
      type: String, // "09:00"
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    payment: {
      status: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded'],
        default: 'unpaid',
      },
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      amount: { type: Number, default: 0 },
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Prevent double booking: a doctor cannot have two active appointments at the same date+time
appointmentSchema.index(
  { doctor: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } },
    name: 'unique_active_slot',
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
