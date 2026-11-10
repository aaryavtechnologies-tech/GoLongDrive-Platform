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

const getBookingQuery = (idParam) => {
  const isObjectId = /^[a-fA-F0-9]{24}$/.test(idParam);
  return isObjectId ? { _id: idParam } : { bookingId: idParam };
};

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
        RIDE_STATUS.DRIVER_ARRIVED,
        RIDE_STATUS.TRIP_STARTED,
        RIDE_STATUS.AWAITING_PAYMENT,
      ] 
    }
  }).populate('customer', 'fullName phoneNumber ridePin profileImage');

  return sendSuccess(res, 200, 'Current ride fetched', { ride });
});

/**
 * @route   POST /api/driver/rides/:id/accept
 * @access  Private (Driver)
 */
const acceptRide = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const booking = await Booking.findOne(getBookingQuery(req.params.id));

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
 * @route   POST /api/driver/rides/:id/arrive
 * @access  Private (Driver)
 */
const arriveRide = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const booking = await Booking.findOne({ ...getBookingQuery(req.params.id), driver: driverId }).populate('customer');

  if (!booking) throw ApiError.notFound('Booking not found');
  if (![RIDE_STATUS.DRIVER_ASSIGNED, RIDE_STATUS.DRIVER_ACCEPTED, RIDE_STATUS.CONFIRMED, RIDE_STATUS.DRIVER_ARRIVING].includes(booking.rideStatus)) {
    throw ApiError.badRequest(`Cannot mark arrived. Current status is ${booking.rideStatus}`);
  }

  booking.rideStatus = RIDE_STATUS.DRIVER_ARRIVED;
  booking.arrivedAt = new Date();
  await booking.save();

  await addTimelineEntry(booking._id, 'Driver Arrived', driverId, 'Driver arrived at pickup location');
  
  // Real-time notification to customer
  const { getCustomerSocket, getIO } = require('../config/socket');
  try {
    const io = getIO();
    const payload = {
      bookingId: booking.bookingId,
      _id: booking._id,
      message: 'Your driver has arrived at the pickup location!',
      ridePin: booking.customer?.ridePin || '',
    };
    if (booking.customer) {
      const custId = booking.customer._id || booking.customer;
      const socketId = getCustomerSocket(custId);
      if (socketId) {
        io.to(socketId).emit('ride:driver_arrived', payload);
      }
    }
    io.to(`ride:${booking.bookingId}`).emit('ride:driver_arrived', payload);
    io.to(`ride:${booking._id}`).emit('ride:driver_arrived', payload);
  } catch (err) {
    console.error('Socket notification error on arrive:', err.message);
  }

  emitBookingEvent('ride:driver_arrived', { bookingId: booking.bookingId });

  return sendSuccess(res, 200, 'Driver arrived at pickup location', { booking });
});

/**
 * @route   POST /api/driver/rides/:id/start
 * @access  Private (Driver)
 */
const startRide = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const { otp, pin, startLat, startLng } = req.body;
  const inputPin = otp || pin;
  
  const booking = await Booking.findOne({ ...getBookingQuery(req.params.id), driver: driverId }).populate('customer');

  if (!booking) throw ApiError.notFound('Booking not found');
  if (![RIDE_STATUS.DRIVER_ASSIGNED, RIDE_STATUS.DRIVER_ACCEPTED, RIDE_STATUS.CONFIRMED, RIDE_STATUS.DRIVER_ARRIVING, RIDE_STATUS.DRIVER_ARRIVED].includes(booking.rideStatus)) {
    throw ApiError.badRequest(`Cannot start trip. Current status is ${booking.rideStatus}`);
  }

  // Validate OTP against customer's ridePin
  if (!inputPin) {
    throw ApiError.badRequest('OTP (Ride PIN) is required to start the trip');
  }
  if (booking.customer && booking.customer.ridePin && booking.customer.ridePin !== inputPin) {
    throw ApiError.badRequest('Invalid OTP. Please check with the passenger.');
  }

  booking.rideStatus = RIDE_STATUS.TRIP_STARTED;
  booking.startedAt = new Date();
  booking.rideStartedAt = new Date();
  if (startLat && startLng) {
    booking.startLocation = {
      coordinates: [Number(startLng), Number(startLat)],
    };
  }
  await booking.save();

  await addTimelineEntry(booking._id, 'Trip Started', driverId, 'Driver started the trip');

  try {
    const { getCustomerSocket, getIO } = require('../config/socket');
    const io = getIO();
    const payload = {
      bookingId: booking.bookingId,
      _id: booking._id,
      message: 'Your journey has started!',
    };
    if (booking.customer) {
      const custId = booking.customer._id || booking.customer;
      const socketId = getCustomerSocket(custId);
      if (socketId) {
        io.to(socketId).emit('ride:started', payload);
      }
    }
    io.to(`ride:${booking.bookingId}`).emit('ride:started', payload);
    io.to(`ride:${booking._id}`).emit('ride:started', payload);
  } catch (err) {
    console.error('Socket error on start ride:', err.message);
  }

  emitBookingEvent('ride:started', { bookingId: booking.bookingId });

  return sendSuccess(res, 200, 'Trip started', { booking });
});

/**
 * @route   POST /api/driver/rides/:id/end
 * @access  Private (Driver)
 */
const endRide = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const { actualDistance, actualDuration, finalFare } = req.body;
  const booking = await Booking.findOne({ ...getBookingQuery(req.params.id), driver: driverId }).populate('customer');

  if (!booking) throw ApiError.notFound('Booking not found');
  if (booking.rideStatus !== RIDE_STATUS.TRIP_STARTED) {
    throw ApiError.badRequest('Cannot end trip. Trip is not currently in progress.');
  }

  if (actualDistance) booking.actualDistance = Number(actualDistance);
  if (actualDuration) booking.actualDuration = Number(actualDuration);
  
  if (finalFare && Number(finalFare) > 0) {
    booking.finalFare = Math.round(Number(finalFare));
  } else if (booking.actualDistance > 0 && booking.pricePerKm > 0) {
    booking.finalFare = Math.round(booking.baseFare + (booking.actualDistance * booking.pricePerKm));
  } else {
    booking.finalFare = booking.finalFare || booking.estimatedFare;
  }

  booking.rideStatus = RIDE_STATUS.AWAITING_PAYMENT;
  booking.rideCompletedAt = new Date();
  await booking.save();

  await addTimelineEntry(booking._id, 'Awaiting Payment', driverId, `Driver ended the trip. Final fare: ₹${booking.finalFare}`);

  try {
    const { getCustomerSocket, getIO } = require('../config/socket');
    const io = getIO();
    const payload = {
      bookingId: booking.bookingId,
      _id: booking._id,
      finalFare: booking.finalFare,
      actualDistance: booking.actualDistance,
      actualDuration: booking.actualDuration,
    };
    if (booking.customer) {
      const custId = booking.customer._id || booking.customer;
      const socketId = getCustomerSocket(custId);
      if (socketId) {
        io.to(socketId).emit('ride:awaiting_payment', payload);
      }
    }
    io.to(`ride:${booking.bookingId}`).emit('ride:awaiting_payment', payload);
    io.to(`ride:${booking._id}`).emit('ride:awaiting_payment', payload);
  } catch (err) {
    console.error('Socket error on end ride:', err.message);
  }

  emitBookingEvent('ride:awaiting_payment', {
    bookingId: booking.bookingId,
    finalFare: booking.finalFare,
    actualDistance: booking.actualDistance,
  });

  return sendSuccess(res, 200, 'Trip ended, awaiting payment', { booking });
});

/**
 * @route   POST /api/driver/rides/:id/complete
 * @access  Private (Driver)
 */
const completeRide = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const { otp, pin, cashCollected } = req.body;
  const booking = await Booking.findOne({ ...getBookingQuery(req.params.id), driver: driverId }).populate('customer');

  if (!booking) throw ApiError.notFound('Booking not found');
  if (booking.rideStatus !== RIDE_STATUS.AWAITING_PAYMENT && booking.rideStatus !== RIDE_STATUS.TRIP_STARTED) {
    throw ApiError.badRequest(`Cannot complete trip. Current status is ${booking.rideStatus}`);
  }

  // Check if payment is completed online or cash collected
  let payment = await Payment.findOne({ booking: booking._id, paymentStatus: 'Paid' });
  const isCash = cashCollected === true || booking.paymentMethod === 'Cash';

  if (!payment && !isCash) {
    throw ApiError.badRequest('Payment has not been completed by the customer yet. Please confirm cash or wait for online payment.');
  }

  if (isCash && (!payment || payment.paymentStatus !== 'Paid')) {
    booking.paymentMethod = 'Cash';
    booking.paymentStatus = 'Paid';
    if (!payment) {
      payment = new Payment({
        paymentId: `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        booking: booking._id,
        customer: booking.customer?._id || booking.customer,
        driver: driverId,
        amount: booking.finalFare || booking.estimatedFare,
        paymentMethod: 'Cash',
        paymentStatus: 'Paid',
        paymentDate: new Date(),
      });
      await payment.save();
    } else {
      payment.paymentStatus = 'Paid';
      payment.paymentMethod = 'Cash';
      payment.paymentDate = new Date();
      await payment.save();
    }
  }

  booking.rideStatus = RIDE_STATUS.TRIP_COMPLETED;
  booking.completedAt = new Date();
  await booking.save();

  // Generate earning record
  const Setting = require('../models/Setting.model');
  const settings = await Setting.findOne();
  const feePercent = settings?.platformFeePercentage || 10;
  const fare = booking.finalFare > 0 ? booking.finalFare : booking.estimatedFare;
  const platformFee = fare * (feePercent / 100);
  
  await generateEarningRecord(booking, platformFee, booking.paymentMethod === 'Cash').catch(err => console.error('Earning error:', err));

  // Mark driver available again
  await Driver.findByIdAndUpdate(driverId, { availabilityStatus: AVAILABILITY_STATUS.AVAILABLE });

  await addTimelineEntry(booking._id, 'Trip Completed', driverId, 'Driver completed the trip');

  try {
    const { getCustomerSocket, getDriverSocket, getIO } = require('../config/socket');
    const io = getIO();
    const payload = {
      bookingId: booking.bookingId,
      _id: booking._id,
      finalFare: booking.finalFare,
      paymentStatus: 'Paid',
    };
    if (booking.customer) {
      const custId = booking.customer._id || booking.customer;
      const socketId = getCustomerSocket(custId);
      if (socketId) {
        io.to(socketId).emit('payment:confirmed', { bookingId: booking.bookingId, amount: fare });
        io.to(socketId).emit('ride:completed', payload);
      }
    }
    const driverSock = getDriverSocket(driverId);
    if (driverSock) {
      io.to(driverSock).emit('ride:completed', payload);
    }
    io.to(`ride:${booking.bookingId}`).emit('ride:completed', payload);
    io.to(`ride:${booking._id}`).emit('ride:completed', payload);
  } catch (err) {
    console.error('Socket error on complete ride:', err.message);
  }

  emitBookingEvent('ride:completed', { bookingId: booking.bookingId, _id: booking._id });

  return sendSuccess(res, 200, 'Trip completed', { booking });
});

/**
 * @route   POST /api/driver/rides/:id/cancel
 * @access  Private (Driver)
 */
const cancelRide = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const { reason } = req.body;
  const booking = await Booking.findOne({ ...getBookingQuery(req.params.id), driver: driverId });

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
 * @route   GET /api/driver/rides/available
 * @access  Private (Driver)
 */
const getAvailableRides = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  // Available rides only from the last 24 hours so drivers get fresh daily requests
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const rides = await Booking.find({ 
    rideStatus: RIDE_STATUS.SEARCHING_DRIVER, 
    bookingType: { $ne: 'tour_package' },
    createdAt: { $gte: twentyFourHoursAgo }
  })
    .sort({ createdAt: -1 })
    .populate('customer', 'fullName phoneNumber profileImage rating');
  return sendSuccess(res, 200, 'Available rides fetched', { rides });
});

/**
 * @route   GET /api/driver/bookings/rides/:id
 * @access  Private (Driver)
 */
const getRideDetails = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const { id } = req.params;
  const mongoose = require('mongoose');

  const query = mongoose.Types.ObjectId.isValid(id)
    ? { _id: id }
    : { bookingId: id };

  const booking = await Booking.findOne(query)
    .populate('customer', 'fullName phoneNumber email rating profileImage')
    .populate('driver', 'fullName phoneNumber vehicle rating driverStatus')
    .populate('tourPackage', 'title days nights destinations imageUrl includes');

  if (!booking) throw ApiError.notFound('Ride booking not found');

  const DriverEarning = require('../models/DriverEarning.model');
  const earning = await DriverEarning.findOne({ booking: booking._id, driver: driverId });

  return sendSuccess(res, 200, 'Ride details retrieved', { 
    booking,
    earning: earning ? {
      driverEarnings: earning.driverEarnings,
      platformFee: earning.platformFee,
      fare: earning.fare,
      payoutStatus: earning.payoutStatus
    } : null
  });
});

/**
 * @route   GET /api/driver/rides/available-packages
 * @access  Private (Driver)
 */
const getUnassignedTourPackages = asyncHandler(async (req, res) => {
  // Return all unassigned tour packages
  const packages = await Booking.find({ 
    bookingType: 'tour_package', 
    rideStatus: RIDE_STATUS.SEARCHING_DRIVER 
  }).sort({ createdAt: -1 })
    .populate('customer', 'fullName')
    .populate('tourPackage', 'title days nights destinations imageUrl includes');
    
  return sendSuccess(res, 200, 'Unassigned tour packages fetched', { packages });
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
  arriveRide,
  startRide,
  endRide,
  completeRide,
  cancelRide,
  getRideHistory,
  getAvailableRides,
  getRideDetails,
  getUnassignedTourPackages,
  getDashboardStats
};
