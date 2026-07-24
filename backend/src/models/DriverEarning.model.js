// src/models/DriverEarning.model.js

const mongoose = require('mongoose');
const { SETTLEMENT_STATUS, PAYMENT_STATUS } = require('../utils/constants');

const driverEarningSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },
    fare: {
      type: Number,
      required: true,
      min: 0,
    },
    commission: {
      type: Number,
      default: 0,
      min: 0,
    },
    platformFee: {
      type: Number,
      required: true,
      min: 0,
    },
    driverEarnings: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    settlementStatus: {
      type: String,
      enum: Object.values(SETTLEMENT_STATUS),
      default: SETTLEMENT_STATUS.PENDING,
    },
    settlementDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

driverEarningSchema.index({ driver: 1 });
// unique handles booking index

module.exports = mongoose.model('DriverEarning', driverEarningSchema);
