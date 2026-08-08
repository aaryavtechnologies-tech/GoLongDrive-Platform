// src/controllers/customer.controller.js
// All customer auth and profile management actions.

const path = require('path');
const Customer = require('../models/Customer.model');
const {
  generateTokenPair,
  verifyRefreshToken,
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

// ── Helper: build image URL ───────────────────────────────────────────────────
const buildImageUrl = (req, filePath) =>
  filePath ? `${req.protocol}://${req.get('host')}/${filePath.replace(/\\/g, '/')}` : null;

// ── Register ──────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/customer/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { fullName, email, phoneNumber, password } = req.body;

  const existing = await Customer.findOne({ $or: [{ email }, { phoneNumber }] });
  if (existing) {
    if (existing.email === email) throw ApiError.conflict('Email is already registered');
    throw ApiError.conflict('Phone number is already registered');
  }

  const customer = await Customer.create({ fullName, email, phoneNumber, password });

  const { accessToken, refreshToken } = generateTokenPair({ id: customer._id, role: customer.role });

  // Persist refresh token
  customer.refreshToken = refreshToken;
  await customer.save({ validateBeforeSave: false });

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  // Fire-and-forget welcome email
  sendWelcomeEmail(email, fullName).catch(() => {});

  return sendSuccess(res, 201, 'Registration successful', {
    accessToken,
    customer: {
      id: customer._id,
      fullName: customer.fullName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      role: customer.role,
      emailVerified: customer.emailVerified,
    },
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/customer/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const customer = await Customer.findOne({ email }).select('+password +refreshToken');
  if (!customer || !(await customer.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!customer.isActive) throw ApiError.forbidden('Your account has been deactivated');

  const { accessToken, refreshToken } = generateTokenPair({ id: customer._id, role: customer.role });

  customer.refreshToken = refreshToken;
  await customer.save({ validateBeforeSave: false });

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  return sendSuccess(res, 200, 'Login successful', {
    accessToken,
    customer: {
      id: customer._id,
      fullName: customer.fullName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      role: customer.role,
      emailVerified: customer.emailVerified,
      profileImage: customer.profileImage,
    },
  });
});

// ── Logout ────────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/customer/logout
 * @access  Private (customer)
 */
const logout = asyncHandler(async (req, res) => {
  await Customer.findByIdAndUpdate(req.user._id, { refreshToken: null });
  res.clearCookie('refreshToken');
  return sendSuccess(res, 200, 'Logged out successfully');
});

// ── Forgot Password ───────────────────────────────────────────────────────────

/**
 * @route   POST /api/customer/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const customer = await Customer.findOne({ email });

  // Always return 200 to prevent user enumeration
  if (!customer) {
    return sendSuccess(res, 200, 'If that email is registered, a reset link has been sent.');
  }

  const otp = generateOTP();
  const hashedToken = hashOTP(otp);
  const expiry = getOTPExpiry();

  customer.passwordResetToken = hashedToken;
  customer.passwordResetExpiry = expiry;
  await customer.save({ validateBeforeSave: false });

  try {
    await sendOTPEmail(email, customer.fullName, otp, 15);
  } catch {
    // Rollback token if email fails
    customer.passwordResetToken = undefined;
    customer.passwordResetExpiry = undefined;
    await customer.save({ validateBeforeSave: false });
    throw ApiError.internal('Failed to send password reset email. Please try again.');
  }

  return sendSuccess(res, 200, 'If that email is registered, a reset link has been sent.');
});

// ── Reset Password ────────────────────────────────────────────────────────────

/**
 * @route   POST /api/customer/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const customer = await Customer.findOne({ email }).select('+passwordResetToken +passwordResetExpiry');

  if (!customer || !customer.passwordResetToken || !customer.passwordResetExpiry) {
    throw ApiError.badRequest('Invalid or expired password reset token');
  }

  const verification = verifyOTP(otp, customer.passwordResetToken, customer.passwordResetExpiry);
  
  if (!verification.valid) {
    if (verification.expired) {
      throw ApiError.badRequest('OTP has expired. Please request a new one.');
    }
    throw ApiError.badRequest('Invalid OTP');
  }

  customer.password = newPassword;
  customer.passwordResetToken = undefined;
  customer.passwordResetExpiry = undefined;
  customer.refreshToken = undefined; // invalidate all sessions
  await customer.save();

  return sendSuccess(res, 200, 'Password has been reset successfully. Please log in.');
});

// ── Send OTP ──────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/customer/send-otp
 * @access  Private (customer)
 */
const sendOTP = asyncHandler(async (req, res) => {
  const customer = req.user;

  if (customer.emailVerified) {
    return sendSuccess(res, 200, 'Email is already verified');
  }

  const otp = generateOTP();
  const hashedOTP = hashOTP(otp);
  const expiry = getOTPExpiry();
  
  // Log OTP in development to bypass email requirement
  console.log(`\n======================================`);
  console.log(`[DEV OTP] Customer: ${customer.email} | OTP: ${otp}`);
  console.log(`======================================\n`);

  await Customer.findByIdAndUpdate(customer._id, {
    otp: hashedOTP,
    otpExpiry: expiry,
  });

  await sendOTPEmail(customer.email, customer.fullName, otp);

  return sendSuccess(res, 200, 'OTP sent to your email address');
});

// ── Verify OTP ────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/customer/verify-otp
 * @access  Private (customer)
 */
const verifyOTPHandler = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  const customer = await Customer.findById(req.user._id).select('+otp +otpExpiry');

  if (!customer.otp) throw ApiError.badRequest('No OTP found. Please request a new OTP.');

  const { valid, expired } = verifyOTP(otp, customer.otp, customer.otpExpiry);

  if (expired) throw ApiError.badRequest('OTP has expired. Please request a new one.');
  if (!valid) throw ApiError.badRequest('Invalid OTP');

  customer.emailVerified = true;
  customer.otp = undefined;
  customer.otpExpiry = undefined;
  await customer.save({ validateBeforeSave: false });

  return sendSuccess(res, 200, 'Email verified successfully');
});

// ── Get Profile ───────────────────────────────────────────────────────────────

/**
 * @route   GET /api/customer/profile
 * @access  Private (customer)
 */
const getProfile = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.user._id);
  return sendSuccess(res, 200, 'Profile fetched successfully', { customer });
});

// ── Update Profile ────────────────────────────────────────────────────────────

/**
 * @route   PUT /api/customer/profile
 * @access  Private (customer)
 */
const updateProfile = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.fullName) updates.fullName = req.body.fullName;
  if (req.body.phoneNumber) updates.phoneNumber = req.body.phoneNumber;

  // Handle profile image upload
  if (req.file) {
    updates.profileImage = `uploads/profile/${req.file.filename}`;
  }

  const customer = await Customer.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return sendSuccess(res, 200, 'Profile updated successfully', { customer });
});

// ── Change Password ───────────────────────────────────────────────────────────

/**
 * @route   PATCH /api/customer/change-password
 * @access  Private (customer)
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const customer = await Customer.findById(req.user._id).select('+password');

  if (!(await customer.comparePassword(currentPassword))) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  if (currentPassword === newPassword) {
    throw ApiError.badRequest('New password must be different from the current password');
  }

  customer.password = newPassword;
  customer.refreshToken = undefined; // Invalidate existing sessions
  await customer.save();

  res.clearCookie('refreshToken');
  return sendSuccess(res, 200, 'Password changed successfully. Please log in again.');
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
};
