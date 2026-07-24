// src/models/Payment.model.js

const mongoose = require('mongoose');
const { PAYMENT_STATUS, PAYMENT_METHODS, GATEWAYS } = require('../utils/constants');

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    advanceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    transactionId: {
      type: String,
    },
    gatewayName: {
      type: String,
      enum: Object.values(GATEWAYS),
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
    paymentDate: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundStatus: {
      type: String,
    },
    refundReason: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster lookups (unique already handles paymentId)
paymentSchema.index({ booking: 1 });
paymentSchema.index({ customer: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
