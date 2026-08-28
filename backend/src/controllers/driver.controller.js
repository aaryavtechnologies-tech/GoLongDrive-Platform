// src/controllers/driver.controller.js
// All driver auth and profile management actions.
// Mirrors customer.controller.js with driver-specific model and fields.

const Driver = require('../models/Driver.model');
const VehicleType = require('../models/VehicleType.model');
const {
  generateTokenPair,
  generatePasswordResetToken,
  hashToken,
  REFRESH_COOKIE_OPTIONS,
} = require('../services/auth.service');
const { generateOTP, hashOTP, getOTPExpiry, verifyOTP } = require('../services/otp.service');
const {
  sendOTPEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require('../services/email.service');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// ── Register ──────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/driver/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { fullName, email, phoneNumber, password } = req.body;

  const existing = await Driver.findOne({ $or: [{ email }, { phoneNumber }] });
  if (existing) {
    if (existing.emailVerified) {
      if (existing.email === email) throw ApiError.conflict('Email is already registered');
      throw ApiError.conflict('Phone number is already registered');
    }
    // If not verified, remove it so we can re-create it (retry flow)
    await Driver.deleteOne({ _id: existing._id });
  }

  const driver = await Driver.create({ fullName, email, phoneNumber, password });

  const { accessToken, refreshToken } = generateTokenPair({ id: driver._id, role: driver.role });

  driver.refreshToken = refreshToken;
  await driver.save({ validateBeforeSave: false });

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  sendWelcomeEmail(email, fullName).catch(() => {});

  return sendSuccess(res, 201, 'Driver registration successful. Awaiting approval.', {
    accessToken,
    driver: {
      id: driver._id,
      fullName: driver.fullName,
      email: driver.email,
      phoneNumber: driver.phoneNumber,
      role: driver.role,
      driverStatus: driver.driverStatus,
      emailVerified: driver.emailVerified,
    },
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/driver/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const driver = await Driver.findOne({ email }).select('+password +refreshToken');
  if (!driver || !(await driver.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!driver.isActive) throw ApiError.forbidden('Your account has been deactivated');

  const { accessToken, refreshToken } = generateTokenPair({ id: driver._id, role: driver.role });

  driver.refreshToken = refreshToken;
  await driver.save({ validateBeforeSave: false });

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  return sendSuccess(res, 200, 'Login successful', {
    accessToken,
    driver: {
      id: driver._id,
      fullName: driver.fullName,
      email: driver.email,
      phoneNumber: driver.phoneNumber,
      role: driver.role,
      driverStatus: driver.driverStatus,
      onlineStatus: driver.onlineStatus,
      availabilityStatus: driver.availabilityStatus,
      emailVerified: driver.emailVerified,
      profileImage: driver.profileImage,
    },
  });
});

// ── Logout ────────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/driver/logout
 * @access  Private (driver)
 */
const logout = asyncHandler(async (req, res) => {
  await Driver.findByIdAndUpdate(req.user._id, {
    refreshToken: null,
    onlineStatus: 'offline',
  });
  res.clearCookie('refreshToken');
  return sendSuccess(res, 200, 'Logged out successfully');
});

// ── Forgot Password ───────────────────────────────────────────────────────────

/**
 * @route   POST /api/driver/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const driver = await Driver.findOne({ email });

  if (!driver) {
    return sendSuccess(res, 200, 'If that email is registered, a reset link has been sent.');
  }

  const otp = generateOTP();
  const hashedToken = hashOTP(otp);
  const expiry = getOTPExpiry();

  driver.passwordResetToken = hashedToken;
  driver.passwordResetExpiry = expiry;
  await driver.save({ validateBeforeSave: false });

  try {
    await sendOTPEmail(email, driver.fullName, otp, 15);
  } catch {
    driver.passwordResetToken = undefined;
    driver.passwordResetExpiry = undefined;
    await driver.save({ validateBeforeSave: false });
    throw ApiError.internal('Failed to send password reset email. Please try again.');
  }

  return sendSuccess(res, 200, 'If that email is registered, a reset link has been sent.');
});

// ── Reset Password ────────────────────────────────────────────────────────────

/**
 * @route   POST /api/driver/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const driver = await Driver.findOne({ email }).select('+passwordResetToken +passwordResetExpiry');

  if (!driver || !driver.passwordResetToken || !driver.passwordResetExpiry) {
    throw ApiError.badRequest('Invalid or expired password reset token');
  }

  const verification = verifyOTP(otp, driver.passwordResetToken, driver.passwordResetExpiry);
  
  if (!verification.valid) {
    if (verification.expired) {
      throw ApiError.badRequest('OTP has expired. Please request a new one.');
    }
    throw ApiError.badRequest('Invalid OTP');
  }

  driver.password = newPassword;
  driver.passwordResetToken = undefined;
  driver.passwordResetExpiry = undefined;
  driver.refreshToken = undefined;
  await driver.save();

  return sendSuccess(res, 200, 'Password has been reset successfully. Please log in.');
});

// ── Send OTP ──────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/driver/send-otp
 * @access  Private (driver)
 */
const sendOTP = asyncHandler(async (req, res) => {
  const driver = req.user;

  if (driver.emailVerified) {
    return sendSuccess(res, 200, 'Email is already verified');
  }

  const otp = generateOTP();
  const hashedOTP = hashOTP(otp);
  const expiry = getOTPExpiry();

  // Log OTP in development to bypass email requirement
  console.log(`\n======================================`);
  console.log(`[DEV OTP] Driver: ${driver.email} | OTP: ${otp}`);
  console.log(`======================================\n`);

  await Driver.findByIdAndUpdate(driver._id, {
    otp: hashedOTP,
    otpExpiry: expiry,
  });

  await sendOTPEmail(driver.email, driver.fullName, otp);

  return sendSuccess(res, 200, 'OTP sent to your email address');
});

// ── Verify OTP ────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/driver/verify-otp
 * @access  Private (driver)
 */
const verifyOTPHandler = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  const driver = await Driver.findById(req.user._id).select('+otp +otpExpiry');

  if (!driver.otp) throw ApiError.badRequest('No OTP found. Please request a new OTP.');

  const { valid, expired } = verifyOTP(otp, driver.otp, driver.otpExpiry);

  if (expired) throw ApiError.badRequest('OTP has expired. Please request a new one.');
  if (!valid) throw ApiError.badRequest('Invalid OTP');

  driver.emailVerified = true;
  driver.otp = undefined;
  driver.otpExpiry = undefined;
  await driver.save({ validateBeforeSave: false });

  return sendSuccess(res, 200, 'Email verified successfully');
});

// ── Get Profile ───────────────────────────────────────────────────────────────

/**
 * @route   GET /api/driver/profile
 * @access  Private (driver)
 */
const getProfile = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.user._id);
  return sendSuccess(res, 200, 'Profile fetched successfully', { driver });
});

// ── Update Profile ────────────────────────────────────────────────────────────

/**
 * @route   PUT /api/driver/profile
 * @access  Private (driver)
 */
const updateProfile = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.fullName) updates.fullName = req.body.fullName;
  if (req.body.phoneNumber) updates.phoneNumber = req.body.phoneNumber;

  if (req.file) {
    updates.profileImage = `uploads/profile/${req.file.filename}`;
  }

  const driver = await Driver.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return sendSuccess(res, 200, 'Profile updated successfully', { driver });
});

// ── Change Password ───────────────────────────────────────────────────────────

/**
 * @route   PATCH /api/driver/change-password
 * @access  Private (driver)
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const driver = await Driver.findById(req.user._id).select('+password');

  if (!(await driver.comparePassword(currentPassword))) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  if (currentPassword === newPassword) {
    throw ApiError.badRequest('New password must be different from the current password');
  }

  driver.password = newPassword;
  driver.refreshToken = undefined;
  await driver.save();

  res.clearCookie('refreshToken');
  return sendSuccess(res, 200, 'Password changed successfully. Please log in again.');
});

// ── Upload Document ───────────────────────────────────────────────────────────

/**
 * @route   POST /api/driver/upload-document
 * @access  Private (driver)
 */
const uploadDocumentHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No document file uploaded');
  }
  const documentUrl = `uploads/documents/${req.file.filename}`;
  return sendSuccess(res, 200, 'Document uploaded successfully', { documentUrl });
});

// ── Submit Registration ───────────────────────────────────────────────────────

/**
 * @route   POST /api/driver/submit-registration
 * @access  Private (driver)
 */
const submitRegistration = asyncHandler(async (req, res) => {
  const { dateOfBirth, address, vehicle, documents } = req.body;
  
  const driver = await Driver.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        dateOfBirth,
        address,
        vehicle,
        documents,
        driverStatus: 'pending', // Move status to pending review
      },
    },
    { new: true, runValidators: true }
  );

  return sendSuccess(res, 200, 'Registration submitted successfully. Awaiting approval.', { driver });
});

// ── Get Vehicle Types ─────────────────────────────────────────────────────────

/**
 * @route   GET /api/driver/vehicle-types
 * @access  Public
 */
const getVehicleTypes = asyncHandler(async (req, res) => {
  const vehicleTypes = await VehicleType.find({ isActive: true }).select('name category iconUrl');
  return sendSuccess(res, 200, 'Vehicle types fetched successfully', { vehicleTypes });
});

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTP: verifyOTPHandler,
  getProfile,
  updateProfile,
  changePassword,
  uploadDocument: uploadDocumentHandler,
  submitRegistration,
  getVehicleTypes,
};
