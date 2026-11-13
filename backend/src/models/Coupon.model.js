// src/models/Coupon.model.js

const mongoose = require('mongoose');
const { DISCOUNT_TYPES } = require('../utils/constants');

const couponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    discountType: {
      type: String,
      enum: Object.values(DISCOUNT_TYPES),
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maximumDiscount: {
      type: Number,
      default: null,
    },
    minimumBookingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    usagePerCustomer: {
      type: Number,
      default: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usages: [
      {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        bookingCode: { type: String },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        customerName: { type: String },
        customerEmail: { type: String },
        customerPhone: { type: String },
        bookingAmount: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        usedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for checking code quickly (unique handles it)
// couponSchema.index({ couponCode: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
