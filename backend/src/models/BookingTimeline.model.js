// src/models/BookingTimeline.model.js

const mongoose = require('mongoose');

const bookingTimelineSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    // The user who performed the action. Could be an ObjectId or 'System'
    performedBy: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

bookingTimelineSchema.index({ booking: 1 });
bookingTimelineSchema.index({ createdAt: -1 });

const BookingTimeline = mongoose.model('BookingTimeline', bookingTimelineSchema);
module.exports = BookingTimeline;
