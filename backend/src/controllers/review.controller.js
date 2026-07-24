// src/controllers/review.controller.js

const Review = require('../models/Review.model');
const Booking = require('../models/Booking.model');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { RIDE_STATUS } = require('../utils/constants');

/**
 * @route   POST /api/v1/reviews
 * @access  Private (Customer)
 */
const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, title, message } = req.body;
  const customerId = req.user._id;

  const booking = await Booking.findOne({ _id: bookingId, customerId, rideStatus: RIDE_STATUS.TRIP_COMPLETED });
  if (!booking) throw ApiError.badRequest('Invalid booking or trip not completed');

  const existingReview = await Review.findOne({ bookingId });
  if (existingReview) throw ApiError.badRequest('You have already reviewed this trip');

  const review = await Review.create({
    bookingId,
    driverId: booking.driverId,
    customerId,
    rating,
    title,
    message
  });

  return sendSuccess(res, 201, 'Review submitted successfully', { review });
});

/**
 * @route   POST /api/v1/reviews/:id/reply
 * @access  Private (Driver)
 */
const replyToReview = asyncHandler(async (req, res) => {
  const { driverReply } = req.body;
  const review = await Review.findOne({ _id: req.params.id, driverId: req.user._id });

  if (!review) throw ApiError.notFound('Review not found');

  review.driverReply = driverReply;
  await review.save();

  return sendSuccess(res, 200, 'Reply submitted', { review });
});

/**
 * @route   GET /api/v1/reviews/driver/:driverId
 * @access  Public
 */
const getDriverReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  
  const reviews = await Review.find({ driverId: req.params.driverId, status: 'Active' })
    .populate('customerId', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return sendSuccess(res, 200, 'Driver reviews fetched', { reviews });
});

/**
 * @route   PATCH /api/v1/admin/reviews/:id/status
 * @access  Private (Admin)
 */
const moderateReview = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'Active', 'Hidden', 'Deleted'
  
  const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!review) throw ApiError.notFound('Review not found');

  return sendSuccess(res, 200, `Review status updated to ${status}`, { review });
});

module.exports = {
  createReview,
  replyToReview,
  getDriverReviews,
  moderateReview
};
