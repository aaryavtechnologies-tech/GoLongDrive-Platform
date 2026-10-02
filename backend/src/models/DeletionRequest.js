const mongoose = require('mongoose');

const deletionRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  userType: { type: String, enum: ['User', 'Driver'], required: true },
  reason: { type: String },
  status: { type: String, enum: ['Pending', 'Processed'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('DeletionRequest', deletionRequestSchema);
