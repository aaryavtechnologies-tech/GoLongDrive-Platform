// src/models/SupportTicket.model.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['customer', 'driver', 'admin'],
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },
    creatorType: {
      type: String,
      enum: ['customer', 'driver'],
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    subject: {
      type: String,
      required: [true, 'Ticket subject is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Payment & Billing', 'Ride Issue', 'Vehicle & Route', 'Account & KYC', 'App Problem', 'Other'],
      default: 'Other',
    },
    description: {
      type: String,
      required: [true, 'Ticket description is required'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    messages: [messageSchema],
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    adminNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

supportTicketSchema.index({ customer: 1 });
supportTicketSchema.index({ driver: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ creatorType: 1 });
supportTicketSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);

