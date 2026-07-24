// src/models/Contact.model.js

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Closed'],
      default: 'Open',
    },
    adminReply: { type: String },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    repliedAt: { type: Date },
  },
  { timestamps: true }
);

contactSchema.index({ status: 1 });

module.exports = mongoose.model('Contact', contactSchema);
