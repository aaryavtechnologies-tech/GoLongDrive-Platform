// src/models/Notification.model.js

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'userType',
    },
    userType: {
      type: String,
      required: true,
      enum: ['Customer', 'Driver', 'Admin'],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    notificationType: {
      type: String,
      enum: [
        'Booking Created',
        'Booking Assigned',
        'Driver Accepted Ride',
        'Driver Rejected Ride',
        'Driver Arrived',
        'Trip Started',
        'Trip Completed',
        'Booking Cancelled',
        'Payment Success',
        'Payment Failed',
        'Refund Processed',
        'Driver Approved',
        'Driver Rejected',
        'Driver Suspended',
        'Coupon Available',
        'System Notification'
      ],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
