// src/controllers/customer.booking.controller.js

const Booking = require('../models/Booking.model');
const { calculateEstimatedFare, calculateFareFromSettings } = require('../services/fare.service');
const { generateBookingId, addTimelineEntry, emitBookingEvent, broadcastRideRequest } = require('../services/booking.service');
const { sendBookingConfirmationEmail, sendBookingCancelledEmail } = require('../services/email.service');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { RIDE_STATUS } = require('../utils/constants');

/**
 * @route   POST /api/customer/bookings
 * @access  Private (Customer)
 */
const createBooking = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const bookingData = req.body;

  // Calculate Fare using admin settings (threshold-based pricing)
  const fareDetails = await calculateFareFromSettings({
    vehicleType: bookingData.vehicleType,
    distanceKm: bookingData.estimatedDistance || bookingData.distance || 0,
  });

  const bookingIdStr = await generateBookingId();

  const newBooking = await Booking.create({
    bookingId: bookingIdStr,
    customer: customerId,
    ...bookingData,
    baseFare: fareDetails.baseFare,
    distanceCharge: fareDetails.distanceCharge,
    pricePerKm: fareDetails.pricePerKm,
    estimatedFare: fareDetails.grandTotal,
    finalFare: fareDetails.grandTotal,
  });

  await addTimelineEntry(newBooking._id, 'Booking Created', customerId, 'Customer created the booking via App');
  emitBookingEvent('booking:created', { bookingId: newBooking.bookingId, status: newBooking.rideStatus });

  // Send email (fire and forget)
  sendBookingConfirmationEmail(req.user.email, req.user.fullName, newBooking).catch(err => console.error(err));

  // Trigger real-time driver broadcast (fire and forget)
  broadcastRideRequest(newBooking._id).catch(err => console.error('Broadcast failed:', err));

  return sendSuccess(res, 201, 'Booking created successfully', { booking: newBooking });
});

/**
 * @route   POST /api/customer/bookings/tour-package
 * @access  Private (Customer)
 */
const bookTourPackage = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const bookingData = req.body;
  const TourPackage = require('../models/TourPackage.model');

  const tourPackage = await TourPackage.findById(bookingData.tourPackage);
  if (!tourPackage) {
    throw ApiError.notFound('Tour package not found');
  }

  const passengers = Number(bookingData.numberOfPassengers) || tourPackage.numberOfPersons || 1;

  // Calculate fare
  let fare = tourPackage.price;
  if (!fare && tourPackage.pricePerPerson) {
    fare = tourPackage.pricePerPerson * passengers;
  }
  if (!fare && tourPackage.pricing && tourPackage.pricing.length > 0) {
    const opt = tourPackage.pricing.find(p => p.vehicleType === bookingData.vehicleType) || tourPackage.pricing[0];
    fare = opt.price;
  }
  if (!fare) fare = 0;

  const bookingIdStr = await generateBookingId();

  const newBooking = await Booking.create({
    bookingId: bookingIdStr,
    customer: customerId,
    bookingType: 'tour_package',
    tripType: 'Tour Package',
    tourPackage: tourPackage._id,
    vehicleType: bookingData.vehicleType || 'Tour Cab',
    numberOfPassengers: passengers,
    pickupDate: bookingData.pickupDate ? new Date(bookingData.pickupDate) : new Date(),
    pickupTime: bookingData.pickupTime || '09:00 AM',
    pickupAddress: bookingData.pickupAddress || tourPackage.route || tourPackage.title,
    pickupCity: bookingData.pickupCity || (tourPackage.placesToExplore && tourPackage.placesToExplore[0]) || 'Tour Origin',
    pickupState: bookingData.pickupState || 'State',
    pickupPincode: bookingData.pickupPincode || '000000',
    dropAddress: bookingData.dropAddress || (tourPackage.placesToExplore && tourPackage.placesToExplore.length > 0 ? tourPackage.placesToExplore.join(', ') : tourPackage.title),
    dropCity: bookingData.dropCity || (tourPackage.placesToExplore && tourPackage.placesToExplore[tourPackage.placesToExplore.length - 1]) || 'Tour Destination',
    dropState: bookingData.dropState || 'State',
    dropPincode: bookingData.dropPincode || '000000',
    specialInstructions: bookingData.specialInstructions || '',
    estimatedFare: fare,
    finalFare: fare,
    baseFare: fare,
    paymentMethod: 'Cash',
    paymentStatus: 'Pending',
    rideStatus: RIDE_STATUS.PENDING,
  });

  await addTimelineEntry(newBooking._id, 'Tour Package Booking Requested', customerId, 'Customer submitted tour booking request without upfront payment. Awaiting Admin phone confirmation.');
  emitBookingEvent('booking:created', { bookingId: newBooking.bookingId, status: newBooking.rideStatus });

  // Send email (fire and forget)
  sendBookingConfirmationEmail(req.user.email, req.user.fullName, newBooking).catch(err => console.error(err));

  return sendSuccess(res, 201, 'Tour package booking request submitted successfully. Our team will contact you shortly to confirm your booking.', { booking: newBooking });
});

/**
 * @route   GET /api/customer/bookings
 * @access  Private (Customer)
 */
const getBookingHistory = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const bookings = await Booking.find({ customer: customerId })
    .populate('customer', 'ridePin')
    .populate('tourPackage', 'title imageUrl route days nights price pricePerPerson placesToExplore')
    .populate('driver', 'fullName phoneNumber vehicleType')
    .sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'Booking history retrieved', { bookings });
});

/**
 * @route   GET /api/customer/bookings/upcoming
 * @access  Private (Customer)
 */
const getUpcomingBookings = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const bookings = await Booking.find({ 
    customer: customerId, 
    rideStatus: { $in: [RIDE_STATUS.PENDING, RIDE_STATUS.SEARCHING_DRIVER, RIDE_STATUS.DRIVER_ASSIGNED, RIDE_STATUS.DRIVER_ACCEPTED, RIDE_STATUS.CONFIRMED] } 
  })
    .populate('tourPackage', 'title imageUrl route days nights price pricePerPerson placesToExplore')
    .populate('driver', 'fullName phoneNumber vehicleType')
    .sort({ pickupDate: 1 });
  return sendSuccess(res, 200, 'Upcoming bookings retrieved', { bookings });
});

/**
 * @route   GET /api/customer/bookings/completed
 * @access  Private (Customer)
 */
const getCompletedBookings = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const bookings = await Booking.find({ 
    customer: customerId, 
    rideStatus: RIDE_STATUS.TRIP_COMPLETED 
  })
    .populate('tourPackage', 'title imageUrl route days nights price pricePerPerson placesToExplore')
    .populate('driver', 'fullName phoneNumber vehicleType')
    .sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'Completed bookings retrieved', { bookings });
});

/**
 * @route   GET /api/customer/bookings/cancelled
 * @access  Private (Customer)
 */
const getCancelledBookings = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const bookings = await Booking.find({ 
    customer: customerId, 
    rideStatus: { $in: [RIDE_STATUS.CANCELLED_BY_CUSTOMER, RIDE_STATUS.CANCELLED_BY_DRIVER, RIDE_STATUS.CANCELLED_BY_ADMIN] } 
  })
    .populate('tourPackage', 'title imageUrl route days nights price pricePerPerson placesToExplore')
    .populate('driver', 'fullName phoneNumber vehicleType')
    .sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'Cancelled bookings retrieved', { bookings });
});

/**
 * @route   GET /api/customer/bookings/:id
 * @access  Private (Customer)
 */
const getBookingDetails = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const booking = await Booking.findOne({ _id: req.params.id, customer: customerId })
    .populate('driver', 'fullName phoneNumber profileImage vehicle rating')
    .populate('tourPackage', 'title imageUrl route days nights price pricePerPerson placesToExplore includes excludes description');
  
  if (!booking) throw ApiError.notFound('Booking not found');

  return sendSuccess(res, 200, 'Booking details retrieved', { booking });
});

/**
 * @route   PUT /api/customer/bookings/:id
 * @access  Private (Customer)
 */
const updateBooking = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const updates = req.body;

  const booking = await Booking.findOne({ _id: req.params.id, customer: customerId });
  if (!booking) throw ApiError.notFound('Booking not found');

  // Can only update if not yet confirmed or started
  if (![RIDE_STATUS.PENDING, RIDE_STATUS.SEARCHING_DRIVER].includes(booking.rideStatus)) {
    throw ApiError.badRequest('Cannot update booking at this stage');
  }

  // If vehicle type or distance changes, recalculate fare
  let fareUpdated = false;
  if (updates.vehicleType || updates.estimatedDistance) {
    const fareDetails = calculateEstimatedFare({
      vehicleType: updates.vehicleType || booking.vehicleType,
      estimatedDistance: updates.estimatedDistance || booking.estimatedDistance || 0,
      days: (updates.tripType || booking.tripType) === 'Multi-Day Rental' ? (updates.numberOfDays || 1) : 1
    });
    updates.estimatedFare = fareDetails.grandTotal;
    updates.finalFare = fareDetails.grandTotal;
    fareUpdated = true;
  }

  const updatedBooking = await Booking.findByIdAndUpdate(booking._id, updates, { new: true, runValidators: true });

  await addTimelineEntry(updatedBooking._id, 'Booking Updated', customerId, fareUpdated ? 'Booking details and fare updated' : 'Booking details updated');
  emitBookingEvent('booking:updated', { bookingId: updatedBooking.bookingId, status: updatedBooking.rideStatus });

  return sendSuccess(res, 200, 'Booking updated successfully', { booking: updatedBooking });
});

/**
 * @route   PATCH /api/customer/bookings/:id/cancel
 * @access  Private (Customer)
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const { reason } = req.body;

  const booking = await Booking.findOne({ _id: req.params.id, customer: customerId });
  if (!booking) throw ApiError.notFound('Booking not found');

  // Can only cancel active bookings
  if ([RIDE_STATUS.TRIP_COMPLETED, RIDE_STATUS.CANCELLED_BY_CUSTOMER, RIDE_STATUS.CANCELLED_BY_DRIVER, RIDE_STATUS.CANCELLED_BY_ADMIN].includes(booking.rideStatus)) {
    throw ApiError.badRequest(`Booking is already ${booking.rideStatus}`);
  }

  booking.rideStatus = RIDE_STATUS.CANCELLED_BY_CUSTOMER;
  await booking.save();

  await addTimelineEntry(booking._id, 'Booking Cancelled', customerId, reason || 'Cancelled by customer');
  emitBookingEvent('booking:cancelled', { bookingId: booking.bookingId, status: booking.rideStatus });

  sendBookingCancelledEmail(req.user.email, req.user.fullName, booking).catch(err => console.error(err));

  return sendSuccess(res, 200, 'Booking cancelled successfully', { booking });
});

/**
 * @route   GET /api/customer/dashboard
 * @access  Private (Customer)
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const customerId = req.user._id;

  const [total, upcoming, completed, cancelled] = await Promise.all([
    Booking.countDocuments({ customer: customerId }),
    Booking.countDocuments({ customer: customerId, rideStatus: { $in: [RIDE_STATUS.PENDING, RIDE_STATUS.CONFIRMED, RIDE_STATUS.DRIVER_ASSIGNED] } }),
    Booking.countDocuments({ customer: customerId, rideStatus: RIDE_STATUS.TRIP_COMPLETED }),
    Booking.countDocuments({ customer: customerId, rideStatus: { $in: [RIDE_STATUS.CANCELLED_BY_CUSTOMER, RIDE_STATUS.CANCELLED_BY_DRIVER, RIDE_STATUS.CANCELLED_BY_ADMIN] } })
  ]);

  return sendSuccess(res, 200, 'Dashboard stats retrieved', {
    stats: { total, upcoming, completed, cancelled }
  });
});

/**
 * @route   GET /api/customer/bookings/current
 * @access  Private (Customer)
 */
const getCurrentRide = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const ride = await Booking.findOne({
    customer: customerId,
    rideStatus: { 
      $in: [
        RIDE_STATUS.SEARCHING_DRIVER,
        RIDE_STATUS.DRIVER_ASSIGNED, 
        RIDE_STATUS.DRIVER_ACCEPTED, 
        RIDE_STATUS.CONFIRMED, 
        RIDE_STATUS.DRIVER_ARRIVING, 
        RIDE_STATUS.TRIP_STARTED
      ] 
    }
  }).populate('driver', 'fullName phoneNumber profileImage vehicle rating');

  return sendSuccess(res, 200, 'Current ride fetched', { ride });
});

/**
 * @route   GET /api/customer/bookings/:id/driver
 * @access  Private (Customer)
 */
const getDriverDetails = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const booking = await Booking.findOne({ _id: req.params.id, customer: customerId })
    .populate('driver', 'fullName phoneNumber profileImage vehicle rating');
  
  if (!booking) throw ApiError.notFound('Booking not found');
  if (!booking.driver) throw ApiError.notFound('Driver not assigned yet');

  return sendSuccess(res, 200, 'Driver details fetched', { driver: booking.driver });
});

module.exports = {
  createBooking,
  bookTourPackage,
  getBookingHistory,
  getUpcomingBookings,
  getCompletedBookings,
  getCancelledBookings,
  getBookingDetails,
  updateBooking,
  cancelBooking,
  getDashboardStats,
  getCurrentRide,
  getDriverDetails
};
