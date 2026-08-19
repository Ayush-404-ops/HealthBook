const Razorpay = require('razorpay');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order  – create a Razorpay order for an appointment
exports.createOrder = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: req.user._id,
    }).populate('doctor');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.payment.status === 'paid') {
      return res.status(400).json({ success: false, message: 'This appointment is already paid' });
    }

    const amountInPaise = appointment.payment.amount * 100; // Razorpay uses paise

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${appointmentId}`,
    });

    // Store the Razorpay order ID on the appointment
    appointment.payment.razorpayOrderId = order.id;
    await appointment.save();

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        appointmentId,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payments/verify  – verify Razorpay signature and confirm appointment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body;

    // Server-side HMAC verification
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // Update appointment on verified payment
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        status: 'confirmed',
        'payment.status': 'paid',
        'payment.razorpayPaymentId': razorpay_payment_id,
      },
      { new: true }
    ).populate([
      { path: 'doctor', populate: { path: 'user', select: 'name email' } },
      { path: 'patient', select: 'name email' },
    ]);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, message: 'Payment verified. Appointment confirmed!', data: appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
