// src/controllers/rides.controller.js
const Booking = require('../models/Booking.model');
const Customer = require('../models/Customer.model');
const VehicleType = require('../models/VehicleType.model');
const Setting = require('../models/Setting.model');
const mapsService = require('../services/maps.service');
const paymentService = require('../services/payment.service');
const { generateBookingId, addTimelineEntry, emitBookingEvent } = require('../services/booking.service');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { RIDE_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } = require('../utils/constants');

/**
 * Helper to calculate fare and advance based on global settings & vehicle details
 */
const calculateFareAndAdvance = async (vehicleTypeName, distanceKm, durationSec) => {
  const vehicle = await VehicleType.findOne({ name: vehicleTypeName });
  const baseFare = vehicle ? vehicle.baseFare : 2000;
  const pricePerKm = vehicle ? vehicle.pricePerKm : 12;

  let calculatedFare = distanceKm * pricePerKm;
  if (calculatedFare < baseFare) {
    calculatedFare = baseFare;
  }
  const totalFare = Math.round(calculatedFare);

  // Fetch admin settings for advance payment rules
  const settings = await Setting.findOne();
  const opts = settings?.longDistanceSettings || {
    advanceAmount: 500,
    advancePercentage: 20,
    isPercentageBased: false,
    minAdvanceAmount: 500
  };

  let advanceAmount = 0;
  if (opts.isPercentageBased) {
    advanceAmount = Math.round((totalFare * opts.advancePercentage) / 100);
    if (advanceAmount < opts.minAdvanceAmount) {
      advanceAmount = opts.minAdvanceAmount;
    }
  } else {
    advanceAmount = opts.advanceAmount;
  }

  // Ensure advance does not exceed total fare
  if (advanceAmount > totalFare) {
    advanceAmount = totalFare;
  }

  return {
    totalFare,
    advanceAmount,
    remainingAmount: totalFare - advanceAmount
  };
};

/**
 * POST /api/v1/rides/estimate
 * Get ride details, distance, duration, fare, advance payment amount.
 */
const estimateRide = asyncHandler(async (req, res) => {
  const { 
    pickupAddress, 
    dropAddress, 
    pickupLat, 
    pickupLng, 
    destinationLat, 
    destinationLng, 
    vehicleType 
  } = req.body;

  if (!pickupAddress || !dropAddress || !vehicleType) {
    throw ApiError.badRequest('pickupAddress, dropAddress, and vehicleType are required');
  }

  let pLat = pickupLat;
  let pLng = pickupLng;
  let dLat = destinationLat;
  let dLng = destinationLng;

  // Resolve coordinates if missing
  if (pLat === undefined || pLng === undefined) {
    const geo = await mapsService.geocode(pickupAddress);
    pLat = geo.lat;
    pLng = geo.lng;
  }
  if (dLat === undefined || dLng === undefined) {
    const geo = await mapsService.geocode(dropAddress);
    dLat = geo.lat;
    dLng = geo.lng;
  }

  // Call Ola Maps Routing Service
  const route = await mapsService.getRoute(pLat, pLng, dLat, dLng);

  // Calculate pricing
  const pricing = await calculateFareAndAdvance(vehicleType, route.distanceValueKm, route.durationValueSec);

  return sendSuccess(res, 200, 'Estimate generated successfully', {
    pickup: { address: pickupAddress, lat: pLat, lng: pLng },
    destination: { address: dropAddress, lat: dLat, lng: dLng },
    route: {
      distanceText: route.distanceText,
      distanceValueKm: route.distanceValueKm,
      durationText: route.durationText,
      durationValueSec: route.durationValueSec,
      polyline: route.polyline
    },
    pricing
  });
});

/**
 * POST /api/v1/rides/book
 * Creates a booking in PAYMENT_PENDING state.
 */
const bookRide = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const {
    pickupAddress,
    pickupCity,
    pickupState,
    pickupPincode,
    dropAddress,
    dropCity,
    dropState,
    dropPincode,
    pickupDate,
    pickupTime,
    vehicleType,
    numberOfPassengers,
    numberOfBags,
    specialInstructions,
    pickupLat,
    pickupLng,
    destinationLat,
    destinationLng
  } = req.body;

  if (!pickupAddress || !dropAddress || !vehicleType || !pickupDate || !pickupTime || !numberOfPassengers) {
    throw ApiError.badRequest('Required booking details are missing');
  }

  let pLat = pickupLat;
  let pLng = pickupLng;
  let dLat = destinationLat;
  let dLng = destinationLng;

  // Geocode if coords not provided
  if (pLat === undefined || pLng === undefined) {
    const geo = await mapsService.geocode(pickupAddress);
    pLat = geo.lat;
    pLng = geo.lng;
  }
  if (dLat === undefined || dLng === undefined) {
    const geo = await mapsService.geocode(dropAddress);
    dLat = geo.lat;
    dLng = geo.lng;
  }

  // Calculate route metrics
  const route = await mapsService.getRoute(pLat, pLng, dLat, dLng);
  const pricing = await calculateFareAndAdvance(vehicleType, route.distanceValueKm, route.durationValueSec);

  const bookingIdStr = await generateBookingId();

  // Create booking
  const booking = await Booking.create({
    bookingId: bookingIdStr,
    customer: customerId,
    bookingType: 'long_distance',
    pickupAddress,
    pickupCity: pickupCity || 'N/A',
    pickupState: pickupState || 'N/A',
    pickupPincode: pickupPincode || 'N/A',
    dropAddress,
    dropCity: dropCity || 'N/A',
    dropState: dropState || 'N/A',
    dropPincode: dropPincode || 'N/A',
    tripType: 'One Way',
    pickupDate: new Date(pickupDate),
    pickupTime,
    vehicleType,
    numberOfPassengers,
    numberOfBags: numberOfBags || 0,
    specialInstructions,
    estimatedDistance: route.distanceValueKm,
    estimatedFare: pricing.totalFare,
    finalFare: pricing.totalFare,
    advanceAmount: pricing.advanceAmount,
    remainingAmount: pricing.remainingAmount,
    paymentStatus: PAYMENT_STATUS.PENDING,
    rideStatus: RIDE_STATUS.PENDING,
    pickupLat: pLat,
    pickupLng: pLng,
    destinationLat: dLat,
    destinationLng: dLng
  });

  await addTimelineEntry(booking._id, 'Booking Drafted', customerId, 'Customer created a long-distance ride booking');
  emitBookingEvent('booking:created', { bookingId: booking.bookingId, status: booking.rideStatus });

  return sendSuccess(res, 201, 'Booking created successfully', { booking });
});

/**
 * GET /api/v1/rides/:id
 */
const getRideDetails = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customer', 'fullName email phoneNumber ridePin')
    .populate('driver', 'fullName phoneNumber profileImage vehicleType');

  if (!booking) throw ApiError.notFound('Booking not found');

  return sendSuccess(res, 200, 'Booking details fetched', { booking });
});

/**
 * GET /api/v1/rides/:id/boarding-pass
 */
const getBoardingPass = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customer', 'fullName email phoneNumber ridePin')
    .populate('driver', 'fullName phoneNumber profileImage vehicleType');

  if (!booking) throw ApiError.notFound('Booking not found');

  // Verify PIN is present on customer, if not generate one on the fly (failsafe)
  if (booking.customer && !booking.customer.ridePin) {
    let ridePin = '';
    let pinUnique = false;
    let attempts = 0;
    while (!pinUnique && attempts < 100) {
      ridePin = String(Math.floor(1000 + Math.random() * 9000));
      const duplicate = await Customer.findOne({ ridePin });
      if (!duplicate) {
        pinUnique = true;
      }
      attempts++;
    }
    if (pinUnique) {
      await Customer.findByIdAndUpdate(booking.customer._id, { ridePin, ridePinCreatedAt: new Date() });
      booking.customer.ridePin = ridePin;
    }
  }

  return sendSuccess(res, 200, 'Boarding pass retrieved', {
    bookingId: booking.bookingId,
    status: booking.rideStatus,
    paymentStatus: booking.paymentStatus,
    pickup: {
      address: booking.pickupAddress,
      lat: booking.pickupLat,
      lng: booking.pickupLng
    },
    destination: {
      address: booking.dropAddress,
      lat: booking.destinationLat,
      lng: booking.destinationLng
    },
    journey: {
      date: booking.pickupDate,
      time: booking.pickupTime,
      distanceKm: booking.estimatedDistance,
      durationText: `${Math.round((booking.estimatedDistance * 1.5))} mins` // estimate
    },
    passenger: {
      name: booking.customer?.fullName || 'N/A',
      phone: booking.customer?.phoneNumber || 'N/A',
      ridePin: booking.customer?.ridePin || 'N/A'
    },
    vehicle: booking.driver ? {
      name: booking.driver.vehicleType || booking.vehicleType,
      model: booking.driver.vehicleType || booking.vehicleType,
      registrationNumber: 'GJ01AB1234', // Simulated
      driverName: booking.driver.fullName,
      driverPhone: booking.driver.phoneNumber
    } : null,
    pricing: {
      totalFare: booking.finalFare || booking.estimatedFare,
      advancePaid: booking.paymentStatus === PAYMENT_STATUS.PENDING ? 0 : booking.advanceAmount,
      remainingAmount: booking.remainingAmount,
      paymentMethod: booking.paymentMethod
    }
  });
});

/**
 * POST /api/v1/rides/:id/payment
 */
const initiateRidePayment = asyncHandler(async (req, res) => {
  const { paymentMethod } = req.body;
  const bookingId = req.params.id;
  const customerId = req.user._id;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking not found');

  let advanceAmount = booking.advanceAmount;
  if (paymentMethod === PAYMENT_METHODS.ONLINE) {
    advanceAmount = booking.estimatedFare;
  }

  const { payment, orderDetails } = await paymentService.createPaymentOrder({
    bookingId,
    customerId,
    advanceAmount,
    totalAmount: booking.estimatedFare,
    paymentMethod: paymentMethod || PAYMENT_METHODS.PARTIAL_ADVANCE,
  });

  return sendSuccess(res, 200, 'Payment initiated', {
    paymentId: payment.paymentId,
    order: orderDetails,
  });
});

/**
 * POST /api/v1/rides/:id/start
 * Driver starts the ride using passenger's permanent unique PIN.
 */
const startRide = asyncHandler(async (req, res) => {
  const { pin, startLat, startLng } = req.body;
  const bookingId = req.params.id;
  const driverId = req.user._id; // authenticated driver

  const booking = await Booking.findById(bookingId).populate('customer');
  if (!booking) throw ApiError.notFound('Booking not found');

  // Verify driver is assigned to booking
  if (!booking.driver || booking.driver.toString() !== driverId.toString()) {
    throw ApiError.forbidden('You are not authorized to start this ride');
  }

  // Verify booking status
  if (booking.rideStatus === RIDE_STATUS.TRIP_STARTED) {
    throw ApiError.badRequest('Ride has already started');
  }
  if (booking.rideStatus === RIDE_STATUS.TRIP_COMPLETED) {
    throw ApiError.badRequest('Ride has already been completed');
  }

  // Verify PIN matches
  if (!booking.customer || booking.customer.ridePin !== pin) {
    throw ApiError.unauthorized('Invalid passenger PIN');
  }

  // Verify early-start window
  const settings = await Setting.findOne();
  const windowMins = settings?.longDistanceSettings?.allowedEarlyStartWindow || 15;
  const now = new Date();
  
  // Combine pickupDate and pickupTime
  const pickupDateStr = booking.pickupDate.toISOString().split('T')[0];
  const pickupDateTime = new Date(`${pickupDateStr}T${booking.pickupTime}`);
  
  const earliestAllowedTime = new Date(pickupDateTime.getTime() - (windowMins * 60 * 1000));
  if (now < earliestAllowedTime) {
    throw ApiError.badRequest(`Ride cannot be started early. Start time window opens at ${earliestAllowedTime.toLocaleTimeString()}`);
  }

  // Update status to Trip Started
  booking.rideStatus = RIDE_STATUS.TRIP_STARTED;
  booking.startedAt = now;
  booking.rideStartedAt = now;
  if (startLat && startLng) {
    booking.startLocation = {
      address: await mapsService.reverseGeocode(startLat, startLng),
      coordinates: [startLng, startLat]
    };
  }

  await booking.save();

  await addTimelineEntry(booking._id, 'Ride Started', driverId, 'Driver started the ride using passenger PIN verification');
  emitBookingEvent('booking:started', { bookingId: booking.bookingId, status: booking.rideStatus });

  return sendSuccess(res, 200, 'Ride started successfully', { booking });
});

/**
 * POST /api/v1/rides/:id/complete
 */
const completeRide = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const driverId = req.user._id;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking not found');

  if (!booking.driver || booking.driver.toString() !== driverId.toString()) {
    throw ApiError.forbidden('You are not authorized to complete this ride');
  }

  const now = new Date();
  booking.rideStatus = RIDE_STATUS.TRIP_COMPLETED;
  booking.completedAt = now;
  booking.rideCompletedAt = now;
  booking.paymentStatus = PAYMENT_STATUS.PAID; // fully paid now

  await booking.save();

  await addTimelineEntry(booking._id, 'Ride Completed', driverId, 'Driver completed the ride');
  emitBookingEvent('booking:completed', { bookingId: booking.bookingId, status: booking.rideStatus });

  return sendSuccess(res, 200, 'Ride completed successfully', { booking });
});

module.exports = {
  estimateRide,
  bookRide,
  getRideDetails,
  getBoardingPass,
  initiateRidePayment,
  startRide,
  completeRide
};
