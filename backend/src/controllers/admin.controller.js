// src/controllers/admin.controller.js
// Admin authentication controller.

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

  // Fetch admin with password field (select: false by default)
  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin || !(await admin.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!admin.isActive) {
    throw ApiError.forbidden('Admin account is deactivated');
  }

  const { accessToken, refreshToken } = generateTokenPair({ id: admin._id, role: admin.role });

  // Store refresh token in httpOnly cookie
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

module.exports = { login };
