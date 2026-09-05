// src/models/Booking.model.js

const mongoose = require('mongoose');
const { TRIP_TYPES, RIDE_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } = require('../utils/constants');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },

    // ── Location Details ──────────────────────────────────────────────────────
    pickupAddress: { type: String, required: true },
    pickupLandmark: { type: String },
    pickupCity: { type: String, required: true },
    pickupState: { type: String, required: true },
    pickupPincode: { type: String, required: true },

    dropAddress: { type: String, required: true },
    dropLandmark: { type: String },
    dropCity: { type: String, required: true },
    dropState: { type: String, required: true },
    dropPincode: { type: String, required: true },

    // ── Trip Details ──────────────────────────────────────────────────────────
    tripType: {
      type: String,
      enum: Object.values(TRIP_TYPES),
      required: true,
    },
    pickupDate: { type: Date, required: true },
    pickupTime: { type: String, required: true },
    returnDate: { type: Date },
    returnTime: { type: String },

    vehicleType: {
      type: String,
      required: true, // E.g., 'Sedan', 'SUV', 'Innova'
    },
    numberOfPassengers: { type: Number, required: true, min: 1 },
    numberOfBags: { type: Number, default: 0 },
    specialInstructions: { type: String },

    estimatedDistance: { type: Number }, // in KM

    // ── Fare Details ──────────────────────────────────────────────────────────
    baseFare: { type: Number, default: 2000 },
    distanceCharge: { type: Number, default: 0 },
    pricePerKm: { type: Number, default: 0 },
    estimatedFare: { type: Number, default: 0 },
    finalFare: { type: Number, default: 0 },
    advanceAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    coupon: { type: String },

    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      default: PAYMENT_METHODS.CASH,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },

    // ── Ride Status ───────────────────────────────────────────────────────────
    rideStatus: {
      type: String,
      enum: Object.values(RIDE_STATUS),
      default: RIDE_STATUS.PENDING,
    },

    // ── Lifecycle Tracking ────────────────────────────────────────────────────
    assignedAt: { type: Date },
    acceptedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelledBy: { type: String }, // 'Customer', 'Driver', 'Admin'
    cancellationReason: { type: String },
    driverResponseTime: { type: Number }, // Time taken by driver to accept in ms

    // ── Long-Distance Booking Enhancements ───────────────────────────────────
    bookingType: {
      type: String,
      enum: ['local', 'long_distance'],
      default: 'local',
    },
    pickupLat: { type: Number },
    pickupLng: { type: Number },
    destinationLat: { type: Number },
    destinationLng: { type: Number },
    rideStartedAt: { type: Date },
    rideCompletedAt: { type: Date },
    startLocation: {
      address: { type: String },
      coordinates: { type: [Number] }, // [lng, lat]
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ customer: 1 });
bookingSchema.index({ driver: 1 });
bookingSchema.index({ rideStatus: 1 });
bookingSchema.index({ pickupDate: 1 });
// unique: true on bookingId already creates an index

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
