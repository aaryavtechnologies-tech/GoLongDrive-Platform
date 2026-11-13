// src/controllers/admin.controller.js
// Admin authentication and profile controller.

const Admin = require('../models/Admin.model');
const { generateTokenPair, REFRESH_COOKIE_OPTIONS } = require('../services/auth.service');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   POST /api/admin/login
 * @desc    Authenticate admin and return JWT tokens
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin || !(await admin.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!admin.isActive) {
    throw ApiError.forbidden('Admin account is deactivated');
  }

  const { accessToken, refreshToken } = generateTokenPair({ id: admin._id, role: admin.role });

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  return sendSuccess(res, 200, 'Login successful', {
    accessToken,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
});

/**
 * @route   GET /api/admin/profile or /api/admin/me
 * @access  Private (Admin)
 */
const getProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user._id).populate('roleId');
  if (!admin) throw ApiError.notFound('Admin profile not found');

  return sendSuccess(res, 200, 'Profile fetched', {
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      roleName: admin.roleId?.name || 'Administrator',
      createdAt: admin.createdAt,
    },
  });
});

/**
 * @route   PUT /api/admin/profile
 * @access  Private (Admin)
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;
  const admin = await Admin.findById(req.user._id).select('+password');
  if (!admin) throw ApiError.notFound('Admin profile not found');

  if (name && name.trim()) admin.name = name.trim();
  if (email && email.trim().toLowerCase() !== admin.email) {
    const existing = await Admin.findOne({
      email: email.trim().toLowerCase(),
      _id: { $ne: admin._id },
    });
    if (existing) throw ApiError.badRequest('Email is already in use by another admin');
    admin.email = email.trim().toLowerCase();
  }

  if (newPassword) {
    if (!currentPassword) {
      throw ApiError.badRequest('Current password is required to set a new password');
    }
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect');
    }
    if (newPassword.length < 8) {
      throw ApiError.badRequest('New password must be at least 8 characters long');
    }
    admin.password = newPassword;
  }

  await admin.save();

  return sendSuccess(res, 200, 'Profile updated successfully', {
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      updatedAt: admin.updatedAt,
    },
  });
});

module.exports = {
  login,
  getProfile,
  updateProfile,
};
