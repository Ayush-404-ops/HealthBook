const Review = require('../models/Review');
const Doctor = require('../models/Doctor');

// POST /api/reviews – patient leaves a review for a doctor
exports.createReview = async (req, res) => {
  try {
    const { doctorId, appointmentId, rating, comment } = req.body;
    if (!doctorId || !rating) {
      return res.status(400).json({ success: false, message: 'doctorId and rating are required' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const review = await Review.create({
      patient: req.user._id,
      doctor: doctorId,
      appointment: appointmentId || null,
      rating: numRating,
      comment: comment || '',
    });

    await review.populate('patient', 'name');

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/reviews/doctor/:doctorId – get reviews for a doctor
exports.getDoctorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ doctor: req.params.doctorId })
      .populate('patient', 'name')
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const average = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;

    res.json({
      success: true,
      data: {
        reviews,
        totalReviews: total,
        averageRating: Number(average.toFixed(1)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/reviews/mine – get reviews by authenticated patient
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ patient: req.user._id })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
