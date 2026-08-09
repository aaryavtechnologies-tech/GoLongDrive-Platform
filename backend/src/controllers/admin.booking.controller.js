// src/controllers/admin.booking.controller.js

const Booking = require('../models/Booking.model');
const Driver = require('../models/Driver.model');
const { calculateEstimatedFare } = require('../services/fare.service');
const { addTimelineEntry, emitBookingEvent, broadcastRideRequest } = require('../services/booking.service');
const { generateEarningRecord } = require('../services/earning.service');
const Payment = require('../models/Payment.model');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { RIDE_STATUS, AVAILABILITY_STATUS, ONLINE_STATUS, DRIVER_STATUS } = require('../utils/constants');

/**
 * @route   GET /api/admin/bookings
 * @access  Private (Admin)
 */
const getAllBookings = asyncHandler(async (req, res) => {
  const { status, date, vehicleType, customerId } = req.query;
  const filter = {};

  if (status) filter.rideStatus = status;
  if (vehicleType) filter.vehicleType = vehicleType;
  if (customerId) filter.customer = customerId;
  
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    filter.pickupDate = { $gte: startOfDay, $lte: endOfDay };
  }

  const bookings = await Booking.find(filter)
    .populate('customer', 'fullName email phoneNumber')
    .populate('driver', 'fullName phoneNumber')
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, 'Bookings retrieved', { bookings });
});

/**
 * @route   GET /api/admin/bookings/:id
 * @access  Private (Admin)
 */
const getBookingDetails = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customer', 'fullName email phoneNumber')
    .populate('driver', 'fullName email phoneNumber driverStatus');
  
  if (!booking) throw ApiError.notFound('Booking not found');

  return sendSuccess(res, 200, 'Booking details retrieved', { booking });
});

/**
 * @route   PUT /api/admin/bookings/:id
 * @access  Private (Admin)
 */
const updateBooking = asyncHandler(async (req, res) => {
  const updates = req.body;

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');

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

  await addTimelineEntry(updatedBooking._id, 'Booking Updated', 'Admin', fareUpdated ? 'Admin updated booking details and fare' : 'Admin updated booking details');
  emitBookingEvent('booking:updated', { bookingId: updatedBooking.bookingId, status: updatedBooking.rideStatus });

  return sendSuccess(res, 200, 'Booking updated successfully', { booking: updatedBooking });
});

/**
 * @route   PATCH /api/admin/bookings/:id/cancel
 * @access  Private (Admin)
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');

  if ([RIDE_STATUS.TRIP_COMPLETED, RIDE_STATUS.CANCELLED_BY_CUSTOMER, RIDE_STATUS.CANCELLED_BY_DRIVER, RIDE_STATUS.CANCELLED_BY_ADMIN].includes(booking.rideStatus)) {
    throw ApiError.badRequest(`Booking is already ${booking.rideStatus}`);
  }

  booking.rideStatus = RIDE_STATUS.CANCELLED_BY_ADMIN;
  await booking.save();

  await addTimelineEntry(booking._id, 'Booking Cancelled', 'Admin', reason || 'Cancelled by Admin');
  emitBookingEvent('booking:cancelled', { bookingId: booking.bookingId, status: booking.rideStatus });

  return sendSuccess(res, 200, 'Booking cancelled successfully', { booking });
});

/**
 * @route   PATCH /api/admin/bookings/:id/assign-driver
 * @access  Private (Admin)
 */
const assignDriver = asyncHandler(async (req, res) => {
  const { driverId } = req.body;
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) throw ApiError.notFound('Booking not found');
  if (![RIDE_STATUS.PENDING, RIDE_STATUS.SEARCHING_DRIVER].includes(booking.rideStatus)) {
    throw ApiError.badRequest('Booking is not waiting for a driver');
  }

  const driver = await Driver.findById(driverId);
  if (!driver || driver.availabilityStatus === AVAILABILITY_STATUS.BUSY) {
    throw ApiError.badRequest('Driver not found or is currently busy');
  }

  booking.driver = driverId;
  booking.rideStatus = RIDE_STATUS.DRIVER_ASSIGNED;
  booking.assignedAt = new Date();
  await booking.save();

  driver.availabilityStatus = AVAILABILITY_STATUS.BUSY;
  await driver.save();

  await addTimelineEntry(booking._id, 'Driver Assigned', 'Admin', `Admin manually assigned driver ${driver.fullName}`);
  emitBookingEvent('driver:assigned', { bookingId: booking.bookingId, driverId });

  // Initiate timeout for admin manual assignment too (optional, but good for consistency)
  const { handleDriverRejection } = require('../services/booking.service');
  setTimeout(() => handleDriverRejection(booking._id, driverId, 'Timeout: Driver did not respond'), 120000);

  return sendSuccess(res, 200, 'Driver assigned successfully', { booking });
});

/**
 * @route   POST /api/admin/bookings/:id/auto-assign
 * @access  Private (Admin)
 */
const autoAssignDriver = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');
  
  await broadcastRideRequest(booking._id);
  return sendSuccess(res, 200, 'Auto-assign triggered. Check status shortly.');
});

/**
 * @route   PATCH /api/admin/bookings/:id/reassign-driver
 * @access  Private (Admin)
 */
const reassignDriver = asyncHandler(async (req, res) => {
  const { driverId } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');

  if (booking.driver) {
    // Free the old driver
    await Driver.findByIdAndUpdate(booking.driver, { availabilityStatus: AVAILABILITY_STATUS.AVAILABLE });
  }

  const newDriver = await Driver.findById(driverId);
  if (!newDriver || newDriver.availabilityStatus === AVAILABILITY_STATUS.BUSY) {
    throw ApiError.badRequest('New Driver not found or is busy');
  }

  booking.driver = driverId;
  booking.rideStatus = RIDE_STATUS.DRIVER_ASSIGNED;
  booking.assignedAt = new Date();
  booking.acceptedAt = null; // reset accepted time
  await booking.save();

  newDriver.availabilityStatus = AVAILABILITY_STATUS.BUSY;
  await newDriver.save();

  await addTimelineEntry(booking._id, 'Driver Reassigned', 'Admin', `Admin reassigned to driver ${newDriver.fullName}`);
  emitBookingEvent('driver:assigned', { bookingId: booking.bookingId, driverId });

  return sendSuccess(res, 200, 'Driver reassigned successfully', { booking });
});

/**
 * @route   PATCH /api/admin/bookings/:id/remove-driver
 * @access  Private (Admin)
 */
const removeDriver = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');
  
  if (booking.driver) {
    await Driver.findByIdAndUpdate(booking.driver, { availabilityStatus: AVAILABILITY_STATUS.AVAILABLE });
    booking.driver = null;
    booking.rideStatus = RIDE_STATUS.SEARCHING_DRIVER;
    await booking.save();
    
    await addTimelineEntry(booking._id, 'Driver Removed', 'Admin', 'Admin removed the assigned driver');
    emitBookingEvent('driver:removed', { bookingId: booking.bookingId });
  }

  return sendSuccess(res, 200, 'Driver removed successfully', { booking });
});

/**
 * @route   PATCH /api/admin/bookings/:id/force-complete
 * @access  Private (Admin)
 */
const forceCompleteRide = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');

  if (booking.rideStatus === RIDE_STATUS.TRIP_COMPLETED) {
    throw ApiError.badRequest('Trip already completed');
  }

  booking.rideStatus = RIDE_STATUS.TRIP_COMPLETED;
  booking.completedAt = new Date();
  await booking.save();

  if (booking.driver) {
    const payment = await Payment.findOne({ booking: booking._id, paymentStatus: { $in: ['Advance Paid', 'Paid'] } });
    const advanceAmount = payment ? payment.advanceAmount : 500;
    await generateEarningRecord(booking, advanceAmount);
    
    await Driver.findByIdAndUpdate(booking.driver, { availabilityStatus: AVAILABILITY_STATUS.AVAILABLE });
  }

  await addTimelineEntry(booking._id, 'Trip Completed', 'Admin', 'Admin force-completed the trip');
  emitBookingEvent('ride:completed', { bookingId: booking.bookingId });

  return sendSuccess(res, 200, 'Trip force-completed successfully', { booking });
});

/**
 * @route   GET /api/admin/drivers/available
 * @access  Private (Admin)
 */
const getAvailableDrivers = asyncHandler(async (req, res) => {
  const { vehicleType, city } = req.query;
  const filter = {
    driverStatus: DRIVER_STATUS.APPROVED,
    onlineStatus: ONLINE_STATUS.ONLINE,
    availabilityStatus: AVAILABILITY_STATUS.AVAILABLE,
  };
  
  if (vehicleType) filter.vehicleType = vehicleType;
  if (city) filter.city = city;

  const drivers = await Driver.find(filter).select('fullName phoneNumber vehicleType city');
  return sendSuccess(res, 200, 'Available drivers fetched', { drivers });
});

/**
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [total, todayBookings, pending, completed, cancelled, revenue] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ createdAt: { $gte: today } }),
    Booking.countDocuments({ rideStatus: RIDE_STATUS.PENDING }),
    Booking.countDocuments({ rideStatus: RIDE_STATUS.TRIP_COMPLETED }),
    Booking.countDocuments({ rideStatus: { $in: [RIDE_STATUS.CANCELLED_BY_CUSTOMER, RIDE_STATUS.CANCELLED_BY_DRIVER, RIDE_STATUS.CANCELLED_BY_ADMIN] } }),
    Booking.aggregate([
      { $match: { rideStatus: RIDE_STATUS.TRIP_COMPLETED } },
      { $group: { _id: null, totalRevenue: { $sum: '$finalFare' } } }
    ])
  ]);

  const driversOnline = await Driver.countDocuments({ onlineStatus: ONLINE_STATUS.ONLINE });
  const driversBusy = await Driver.countDocuments({ availabilityStatus: AVAILABILITY_STATUS.BUSY });
  const driversOffline = await Driver.countDocuments({ onlineStatus: ONLINE_STATUS.OFFLINE });

  return sendSuccess(res, 200, 'Admin Dashboard stats retrieved', {
    stats: {
      total,
      todayBookings,
      pending,
      completed,
      cancelled,
      revenueEstimate: revenue.length ? revenue[0].totalRevenue : 0,
      drivers: {
        online: driversOnline,
        busy: driversBusy,
        offline: driversOffline
      }
    }
  });
});

module.exports = {
  getAllBookings,
  getBookingDetails,
  updateBooking,
  cancelBooking,
  assignDriver,
  autoAssignDriver,
  reassignDriver,
  removeDriver,
  forceCompleteRide,
  getAvailableDrivers,
  getDashboardStats
};
