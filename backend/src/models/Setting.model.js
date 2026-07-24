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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
