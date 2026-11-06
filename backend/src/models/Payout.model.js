// src/models/Payout.model.js

const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    payoutId: {
      type: String,
      required: true,
      unique: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payout amount is required'],
      min: [100, 'Minimum payout request amount is ₹100'],
    },
    payoutMethod: {
      type: String,
      enum: ['Bank Transfer', 'UPI'],
      default: 'Bank Transfer',
    },
    accountDetails: {
      accountHolderName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      upiId: { type: String },
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Paid', 'Rejected'],
      default: 'Pending',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    transactionReference: {
      type: String, // UTR, IMPS, or transaction reference number
    },
    adminNotes: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

payoutSchema.index({ driver: 1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ requestedAt: -1 });

module.exports = mongoose.model('Payout', payoutSchema);

