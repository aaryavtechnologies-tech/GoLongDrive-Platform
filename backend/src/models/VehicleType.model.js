// src/models/VehicleType.model.js

const mongoose = require('mongoose');

const vehicleTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vehicle type name is required'],
      trim: true,
      unique: true,
    },
    category: {
      type: String, // e.g., Sedan, SUV, Innova
      required: true,
    },
    baseFare: {
      type: Number,
      required: true,
      min: 2000, // Enforcing 2000 Rs minimum as requested
      default: 2000,
    },
    pricePerKm: {
      type: Number,
      required: true,
      min: 0,
    },
    advanceAmount: {
      type: Number,
      default: 500, // Enforcing 500 Rs minimum advance as requested
      min: 500,
    },
    seatingCapacity: {
      type: Number,
      required: true,
      default: 4,
    },
    luggageCapacity: {
      type: Number,
      required: true,
      default: 2,
    },
    iconUrl: {
      type: String, // URL or local path
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const VehicleType = mongoose.model('VehicleType', vehicleTypeSchema);
module.exports = VehicleType;
