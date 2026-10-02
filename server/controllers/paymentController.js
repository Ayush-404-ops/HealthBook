const Razorpay = require('razorpay');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');

const isKeyConfigured = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return (
    keyId &&
    !keyId.includes('xxxx') &&
    keyId !== 'rzp_test_placeholder' &&
    keySecret &&
    !keySecret.includes('xxxx')
  );
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

/**
 * Reusable helper to process a refund on Razorpay and update appointment payment status.
 */
const processRefund = async (appointment) => {
  if (!appointment || !appointment.payment || appointment.payment.status !== 'paid') {
    return { success: false, message: 'Appointment is not in paid status' };
  }

  let refundDetails = null;

  if (appointment.payment.razorpayPaymentId && isKeyConfigured()) {
    try {
      refundDetails = await razorpay.payments.refund(appointment.payment.razorpayPaymentId, {
        amount: Math.round(appointment.payment.amount * 100), // paise
        notes: {
          appointmentId: appointment._id.toString(),
          reason: 'Appointment cancellation refund',
        },
      });
    } catch (err) {
      console.error('Razorpay refund API call failed:', err);
    }
  }

  appointment.payment.status = 'refunded';
  if (refundDetails?.id) {
    appointment.payment.razorpayRefundId = refundDetails.id;
  }
  return { success: true, refund: refundDetails };
};

exports.processRefund = processRefund;

// POST /api/payments/create-order – create a Razorpay order for an appointment
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

    let orderId;
    let orderAmount = amountInPaise;
    let orderCurrency = 'INR';

    if (isKeyConfigured()) {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${appointmentId}`,
      });
      orderId = order.id;
      orderAmount = order.amount;
      orderCurrency = order.currency;
    } else {
      // Demo / Fallback mode when placeholder Razorpay keys are used
      orderId = `order_demo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    // Store the Razorpay order ID on the appointment
    appointment.payment.razorpayOrderId = orderId;
    await appointment.save();

    res.json({
      success: true,
      data: {
        orderId,
        amount: orderAmount,
        currency: orderCurrency,
        appointmentId,
        keyId: isKeyConfigured() ? process.env.RAZORPAY_KEY_ID : 'rzp_test_demo',
        isDemo: !isKeyConfigured(),
      },
    });
  } catch (err) {
    console.error('Payment createOrder error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create payment order. Please check your Razorpay API keys.',
    });
  }
};

// POST /api/payments/verify – verify Razorpay signature and confirm appointment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body;

    // 1. Ownership check — only the patient who owns this appointment may verify
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // 2. Ensure the Razorpay order ID matches the one we stored during createOrder
    if (appointment.payment.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID mismatch. This payment does not belong to this appointment.',
      });
    }

    // 3. Reject if already paid (prevent double-confirmation)
    if (appointment.payment.status === 'paid') {
      return res.status(400).json({ success: false, message: 'This appointment is already paid' });
    }

    // 4. Server-side HMAC signature verification (if real keys configured)
    if (isKeyConfigured()) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature))) {
        return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
      }
    }

    // 5. All checks passed — mark as paid and confirmed
    appointment.status = 'confirmed';
    appointment.payment.status = 'paid';
    appointment.payment.razorpayPaymentId = razorpay_payment_id || `pay_demo_${Date.now()}`;
    await appointment.save();

    // Re-fetch with populated references for the response
    const populated = await Appointment.findById(appointment._id).populate([
      { path: 'doctor', populate: { path: 'user', select: 'name email' } },
      { path: 'patient', select: 'name email' },
    ]);

    res.json({ success: true, message: 'Payment verified. Appointment confirmed!', data: populated });
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ success: false, message: err.message || 'Payment verification error.' });
  }
};

// POST /api/payments/refund – refund a paid appointment
exports.refundPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'appointmentId is required' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const isOwner = appointment.patient.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin' && req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Not authorized to refund this appointment' });
    }

    if (appointment.payment.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: `Cannot refund appointment with payment status "${appointment.payment.status}"`,
      });
    }

    await processRefund(appointment);
    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Payment refunded successfully and appointment cancelled',
      data: appointment,
    });
  } catch (err) {
    console.error('Payment refund error:', err);
    res.status(500).json({ success: false, message: err.message || 'Refund error.' });
  }
};
