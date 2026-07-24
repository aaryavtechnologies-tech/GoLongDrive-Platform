// src/models/Driver.model.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, DRIVER_STATUS, ONLINE_STATUS, AVAILABILITY_STATUS } = require('../utils/constants');

const driverSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },

    profileImage: {
      type: String,
      default: null,
    },

    // ── Driver-specific status fields ─────────────────────────────────────────

    driverStatus: {
      type: String,
      enum: Object.values(DRIVER_STATUS),
      default: DRIVER_STATUS.PENDING,
    },

    onlineStatus: {
      type: String,
      enum: Object.values(ONLINE_STATUS),
      default: ONLINE_STATUS.OFFLINE,
    },

    availabilityStatus: {
      type: String,
      enum: Object.values(AVAILABILITY_STATUS),
      default: AVAILABILITY_STATUS.AVAILABLE,
    },

    // Used for auto-assignment matching
    vehicleType: {
      type: String,
      default: 'Sedan',
    },
    city: {
      type: String,
      default: 'Unknown',
    },

    // ── Auth / Security fields ────────────────────────────────────────────────

    emailVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpiry: {
      type: Date,
      select: false,
    },

    refreshToken: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.DRIVER,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Note: email and phoneNumber indexes are created automatically by unique:true on those fields.
// Additional indexes for frequent query patterns:
driverSchema.index({ driverStatus: 1 });
driverSchema.index({ onlineStatus: 1, availabilityStatus: 1 });

// ── Pre-save hook: hash password ──────────────────────────────────────────────
driverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance methods ──────────────────────────────────────────────────────────
driverSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Driver = mongoose.model('Driver', driverSchema);
module.exports = Driver;
