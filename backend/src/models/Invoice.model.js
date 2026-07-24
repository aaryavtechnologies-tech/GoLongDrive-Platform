// src/models/Invoice.model.js

const mongoose = require('mongoose');
const { INVOICE_STATUS } = require('../utils/constants');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
    },
    companyName: {
      type: String,
      default: 'Long Distance Taxi Platform',
    },
    // Storing snapshots of details in case referenced objects change later
    customerDetails: {
      fullName: String,
      email: String,
      phoneNumber: String,
    },
    driverDetails: {
      fullName: String,
      phoneNumber: String,
      vehicleType: String,
    },
    bookingDetails: {
      pickupAddress: String,
      pickupCity: String,
      dropAddress: String,
      dropCity: String,
      tripDate: Date,
      vehicle: String,
    },
    fareBreakdown: {
      baseFare: Number,
      distanceFare: Number,
      driverAllowance: Number,
      nightCharge: Number,
      stateTax: Number,
      parking: Number,
      toll: Number,
      waitingCharge: Number,
      extraCharges: Number,
    },
    discount: {
      type: Number,
      default: 0,
    },
    taxes: {
      type: Number,
      default: 0,
    },
    advancePaid: {
      type: Number,
      default: 0,
    },
    remainingPaid: {
      type: Number,
      default: 0,
    },
    totalPaid: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    invoiceStatus: {
      type: String,
      enum: Object.values(INVOICE_STATUS),
      default: INVOICE_STATUS.GENERATED,
    },
  },
  {
    timestamps: true,
  }
);

// Unique fields already create indexes automatically
invoiceSchema.index({ booking: 1 });
invoiceSchema.index({ customer: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
