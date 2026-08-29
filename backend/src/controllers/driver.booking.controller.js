// src/controllers/driver.booking.controller.js

const Booking = require('../models/Booking.model');
const Driver = require('../models/Driver.model');
const { addTimelineEntry, emitBookingEvent, handleDriverRejection, clearAssignmentTimer, notifyCustomerDriverAssigned, notifyOtherDriversRideTaken } = require('../services/booking.service');
const { generateEarningRecord } = require('../services/earning.service');
const Payment = require('../models/Payment.model');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { RIDE_STATUS, ONLINE_STATUS, AVAILABILITY_STATUS } = require('../utils/constants');

/**
 * @route   PATCH /api/driver/status
 * @access  Private (Driver)
 */
const toggleStatus = asyncHandler(async (req, res) => {
  const { onlineStatus, availabilityStatus } = req.body;
  const driver = await Driver.findById(req.user._id);

  if (onlineStatus) driver.onlineStatus = onlineStatus;
  if (availabilityStatus) driver.availabilityStatus = availabilityStatus;

  await driver.save();
  
  emitBookingEvent('driver:status_changed', { driverId: driver._id, onlineStatus: driver.onlineStatus, availabilityStatus: driver.availabilityStatus });

  return sendSuccess(res, 200, 'Status updated', {
    onlineStatus: driver.onlineStatus,
    availabilityStatus: driver.availabilityStatus
  });
});

/**
 * @route   GET /api/driver/rides/current
 * @access  Private (Driver)
 */
const getCurrentRide = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const ride = await Booking.findOne({
    driver: driverId,
    rideStatus: { 
      $in: [
        RIDE_STATUS.DRIVER_ASSIGNED, 
        RIDE_STATUS.DRIVER_ACCEPTED, 
        RIDE_STATUS.CONFIRMED, 
        RIDE_STATUS.DRIVER_ARRIVING, 
        RIDE_STATUS.TRIP_STARTED
      ] 
    }
  }).populate('customer', 'fullName phoneNumber');

  return sendSuccess(res, 200, 'Current ride fetched', { ride });
});

/**
 * @route   POST /api/driver/rides/:id/accept
 * @access  Private (Driver)
 */
const acceptRide = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const booking = await Booking.findById(req.params.id);

  if (!booking) throw ApiError.notFound('Booking not found');

  // If it's a broadcast request
  if (booking.rideStatus === RIDE_STATUS.SEARCHING_DRIVER) {
    const activeRideCount = await Booking.countDocuments({
      driver: driverId,
      rideStatus: { $in: [RIDE_STATUS.DRIVER_ACCEPTED, RIDE_STATUS.CONFIRMED, RIDE_STATUS.DRIVER_ARRIVING, RIDE_STATUS.TRIP_STARTED] }
    });

    if (activeRideCount > 0) throw ApiError.badRequest('You already have an active ride');

    // Atomically update to prevent race conditions when multiple drivers accept simultaneously
    const updatedBooking = await Booking.findOneAndUpdate(
      { _id: booking._id, rideStatus: RIDE_STATUS.SEARCHING_DRIVER },
      { 
        $set: { 
          driver: driverId, 
          rideStatus: RIDE_STATUS.DRIVER_ACCEPTED, 
          acceptedAt: new Date(), 
          assignedAt: new Date() 
        } 
      },
      { new: true }
    );

    if (!updatedBooking) {
       throw ApiError.badRequest('Ride is no longer available. Another driver accepted it first.');
    }

    await Driver.findByIdAndUpdate(driverId, { availabilityStatus: AVAILABILITY_STATUS.BUSY });

    await addTimelineEntry(updatedBooking._id, 'Driver Accepted', driverId, 'Driver accepted the broadcasted ride');
    
    // Notify other drivers who got the same broadcast that the ride is taken
    const broadcastedIds = global._broadcastMap?.get(updatedBooking._id.toString()) || [];
    notifyOtherDriversRideTaken(broadcastedIds, driverId, updatedBooking.bookingId);
    if (global._broadcastMap) global._broadcastMap.delete(updatedBooking._id.toString());

    // Notify the customer in real time that a driver has been assigned
    if (updatedBooking.customer) {
      const driverDoc = await Driver.findById(driverId).select('fullName phoneNumber profileImage vehicle');
      if (driverDoc) {
        await notifyCustomerDriverAssigned(updatedBooking.customer, updatedBooking, driverDoc);
      }
    }

    // Stop the 2-minute fallback timer
    clearAssignmentTimer(updatedBooking._id);

    return sendSuccess(res, 200, 'Ride accepted successfully', { booking: updatedBooking });
  }

  // Fallback for manually assigned rides by admin
  if (booking.driver?.toString() === driverId.toString() && booking.rideStatus === RIDE_STATUS.DRIVER_ASSIGNED) {
    const activeRideCount = await Booking.countDocuments({
      driver: driverId,
      rideStatus: { $in: [RIDE_STATUS.DRIVER_ACCEPTED, RIDE_STATUS.CONFIRMED, RIDE_STATUS.DRIVER_ARRIVING, RIDE_STATUS.TRIP_STARTED] }
    });

    if (activeRideCount > 0) throw ApiError.badRequest('You already have an active ride');

    booking.rideStatus = RIDE_STATUS.DRIVER_ACCEPTED;
    booking.acceptedAt = new Date();
    if (booking.assignedAt) {
      booking.driverResponseTime = booking.acceptedAt.getTime() - booking.assignedAt.getTime();
    }
    await booking.save();

    await Driver.findByIdAndUpdate(driverId, { availabilityStatus: AVAILABILITY_STATUS.BUSY });

    await addTimelineEntry(booking._id, 'Driver Accepted', driverId, 'Driver accepted the manually assigned ride');

    // Notify the customer in real time
    if (booking.customer) {
      const driverDoc = await Driver.findById(driverId).select('fullName phoneNumber profileImage vehicle');
      if (driverDoc) {
        await notifyCustomerDriverAssigned(booking.customer, booking, driverDoc);
      }
    }

    return sendSuccess(res, 200, 'Ride accepted successfully', { booking });
  }

  throw ApiError.badRequest(`Cannot accept. Ride is currently ${booking.rideStatus} or not assigned to you`);
});

/**
 * @route   POST /api/driver/rides/:id/reject
 * @access  Private (Driver)
 */
const rejectRide = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const { reason } = req.body;
  
  // Handled by service to ensure logic reuse
  await handleDriverRejection(req.params.id, driverId, reason || 'Manually rejected by driver');
  
  return sendSuccess(res, 200, 'Ride rejected');
});

/**
 * @route   POST /api/driver/rides/:id/start
 * @access  Private (Driver)
 */
const startRide = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const { otp } = req.body;
  
  const booking = await Booking.findOne({ _id: req.params.id, driver: driverId }).populate('customer');

  if (!booking) throw ApiError.notFound('Booking not found');
  if (![RIDE_STATUS.DRIVER_ACCEPTED, RIDE_STATUS.CONFIRMED, RIDE_STATUS.DRIVER_ARRIVING].includes(booking.rideStatus)) {
    throw ApiError.badRequest(`Cannot start trip. Current status is ${booking.rideStatus}`);
  }

  // Validate OTP against customer's ridePin
  if (!otp) {
    throw ApiError.badRequest('OTP (Ride PIN) is required to start the trip');
  }
  if (booking.customer && booking.customer.ridePin !== otp) {
    throw ApiError.badRequest('Invalid OTP. Please check with the passenger.');
  }

  booking.rideStatus = RIDE_STATUS.TRIP_STARTED;
  booking.startedAt = new Date();
  await booking.save();

  await addTimelineEntry(booking._id, 'Trip Started', driverId, 'Driver started the trip');
  emitBookingEvent('ride:started', { bookingId: booking.bookingId });

  return sendSuccess(res, 200, 'Trip started', { booking });
});

/**
 * @route   POST /api/driver/rides/:id/complete
 * @access  Private (Driver)
 */
const completeRide = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const booking = await Booking.findOne({ _id: req.params.id, driver: driverId });

  if (!booking) throw ApiError.notFound('Booking not found');
  if (booking.rideStatus !== RIDE_STATUS.TRIP_STARTED) {
    throw ApiError.badRequest('Cannot complete trip. Trip has not started.');
  }

  booking.rideStatus = RIDE_STATUS.TRIP_COMPLETED;
  booking.completedAt = new Date();
  await booking.save();

  // Generate earning record
  // Fetch payment to see what advance was paid
  const payment = await Payment.findOne({ booking: booking._id, paymentStatus: { $in: ['Advance Paid', 'Paid'] } });
  const advanceAmount = payment ? payment.advanceAmount : 500;
  await generateEarningRecord(booking, advanceAmount);

  // Mark driver available again
  await Driver.findByIdAndUpdate(driverId, { availabilityStatus: AVAILABILITY_STATUS.AVAILABLE });

  await addTimelineEntry(booking._id, 'Trip Completed', driverId, 'Driver completed the trip');
  emitBookingEvent('ride:completed', { bookingId: booking.bookingId });

  return sendSuccess(res, 200, 'Trip completed', { booking });
});

/**
 * @route   POST /api/driver/rides/:id/cancel
 * @access  Private (Driver)
 */
const cancelRide = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const { reason } = req.body;
  const booking = await Booking.findOne({ _id: req.params.id, driver: driverId });

  if (!booking) throw ApiError.notFound('Booking not found');
  if (booking.rideStatus === RIDE_STATUS.TRIP_COMPLETED || booking.rideStatus.includes('Cancelled')) {
    throw ApiError.badRequest(`Ride already ${booking.rideStatus}`);
  }

  booking.rideStatus = RIDE_STATUS.CANCELLED_BY_DRIVER;
  booking.cancelledAt = new Date();
  booking.cancelledBy = 'Driver';
  booking.cancellationReason = reason || 'Driver cancelled';
  await booking.save();

  await Driver.findByIdAndUpdate(driverId, { availabilityStatus: AVAILABILITY_STATUS.AVAILABLE });

  await addTimelineEntry(booking._id, 'Cancelled by Driver', driverId, reason);
  emitBookingEvent('ride:cancelled', { bookingId: booking.bookingId, reason });

  return sendSuccess(res, 200, 'Trip cancelled', { booking });
});

/**
 * @route   GET /api/driver/rides/history
 * @access  Private (Driver)
 */
const getRideHistory = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const rides = await Booking.find({ driver: driverId, rideStatus: { $in: [RIDE_STATUS.TRIP_COMPLETED, RIDE_STATUS.CANCELLED_BY_DRIVER, RIDE_STATUS.CANCELLED_BY_CUSTOMER, RIDE_STATUS.CANCELLED_BY_ADMIN] } }).sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'Ride history fetched', { rides });
});

/**
 * @route   GET /api/driver/dashboard
 * @access  Private (Driver)
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [upcoming, todayTrips, completed, cancelled, driverInfo] = await Promise.all([
    Booking.countDocuments({ driver: driverId, rideStatus: { $in: [RIDE_STATUS.DRIVER_ACCEPTED, RIDE_STATUS.CONFIRMED, RIDE_STATUS.DRIVER_ARRIVING] } }),
    Booking.countDocuments({ driver: driverId, pickupDate: { $gte: today } }),
    Booking.countDocuments({ driver: driverId, rideStatus: RIDE_STATUS.TRIP_COMPLETED }),
    Booking.countDocuments({ driver: driverId, rideStatus: { $in: [RIDE_STATUS.CANCELLED_BY_DRIVER, RIDE_STATUS.CANCELLED_BY_CUSTOMER, RIDE_STATUS.CANCELLED_BY_ADMIN] } }),
    Driver.findById(driverId).select('onlineStatus availabilityStatus')
  ]);

  return sendSuccess(res, 200, 'Dashboard fetched', {
    stats: { upcoming, todayTrips, completed, cancelled },
    status: driverInfo
  });
});

module.exports = {
  toggleStatus,
  getCurrentRide,
  acceptRide,
  rejectRide,
  startRide,
  completeRide,
  cancelRide,
  getRideHistory,
  getDashboardStats
};
