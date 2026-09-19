const mongoose = require('mongoose');

const tourPackageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    days: {
      type: Number,
      required: true,
    },
    nights: {
      type: Number,
      required: true,
    },
    includes: [{
      type: String,
    }],
    excludes: [{
      type: String,
    }],
    imageUrl: {
      type: String,
    },
    destinations: [{
      lat: Number,
      lng: Number,
      name: String,
    }],
    pricing: [{
      vehicleType: {
        type: String, // 'Sedan', 'SUV', etc.
        required: true,
      },
      price: {
        type: Number,
        required: true,
      }
    }],
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

tourPackageSchema.index({ isActive: 1 });

const TourPackage = mongoose.model('TourPackage', tourPackageSchema);
module.exports = TourPackage;
