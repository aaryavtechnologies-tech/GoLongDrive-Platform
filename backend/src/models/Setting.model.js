// src/models/Setting.model.js

const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: 'Long Distance Taxi' },
    companyEmail: { type: String, default: 'info@taxiapp.com' },
    supportEmail: { type: String, default: 'support@taxiapp.com' },
    supportPhone: { type: String, default: '+91-0000000000' },
    whatsappNumber: { type: String, default: '+91-0000000000' },
    officeAddress: { type: String, default: '123 Main Street, City, Country' },
    gstNumber: { type: String },
    panNumber: { type: String },
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    invoicePrefix: { type: String, default: 'INV-' },
    bookingPrefix: { type: String, default: 'CAB-' },
    logo: { type: String }, // URL or path
    favicon: { type: String },
    smtpSettings: {
      host: String,
      port: Number,
      user: String,
      pass: String,
      secure: Boolean,
    },
    paymentGatewaySettings: {
      provider: { type: String, default: 'Razorpay' },
      apiKey: String,
      apiSecret: String,
      webhookSecret: String,
    },
    securitySettings: {
      passwordMinLength: { type: Number, default: 8 },
      requireUppercase: { type: Boolean, default: true },
      requireNumbers: { type: Boolean, default: true },
      requireSymbols: { type: Boolean, default: true },
      sessionTimeout: { type: Number, default: 60 },
      loginAttemptLimit: { type: Number, default: 5 },
      jwtTokenDuration: { type: String, default: '15m' },
      refreshTokenDuration: { type: String, default: '7d' },
    },
    notificationSettings: {
      enableEmailNotifications: { type: Boolean, default: true },
      bookingNotifications: { type: Boolean, default: true },
      driverNotifications: { type: Boolean, default: true },
      paymentNotifications: { type: Boolean, default: true },
      documentNotifications: { type: Boolean, default: true },
      systemNotifications: { type: Boolean, default: true },
    },
    longDistanceSettings: {
      advanceAmount: { type: Number, default: 500 },
      advancePercentage: { type: Number, default: 20 },
      isPercentageBased: { type: Boolean, default: false },
      minAdvanceAmount: { type: Number, default: 500 },
      allowedEarlyStartWindow: { type: Number, default: 15 }, // minutes
      pinVerificationRequired: { type: Boolean, default: true },
      minBookingLeadTime: { type: Number, default: 2 }, // hours
      cancellationRules: { type: String, default: "Free cancellation up to 24 hours before pickup" },
      refundRules: { type: String, default: "Full refund if cancelled before 24 hours, otherwise no refund" },
      longDistanceAvailability: { type: Boolean, default: true },
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
