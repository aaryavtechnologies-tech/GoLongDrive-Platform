// src/middleware/auth.middleware.js
// Verifies the Bearer JWT in the Authorization header, attaches req.user,
// and guards routes that require authentication.

const { verifyAccessToken } = require('../services/auth.service');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const Customer = require('../models/Customer.model');
const Driver = require('../models/Driver.model');
const Admin = require('../models/Admin.model');
const { ROLES } = require('../utils/constants');

// ── Model map ─────────────────────────────────────────────────────────────────

const modelByRole = {
  [ROLES.ADMIN]: Admin,
  [ROLES.CUSTOMER]: Customer,
  [ROLES.DRIVER]: Driver,
};

// ── Middleware ────────────────────────────────────────────────────────────────

/**
 * Verifies the access token and attaches the authenticated user to req.user.
 * Checks that the user still exists and is active in the database.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Support Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) throw ApiError.unauthorized('Authentication required. No token provided.');

  // Decode and verify
  const decoded = verifyAccessToken(token);

  // Fetch fresh user from DB to ensure account still exists and is active
  const Model = modelByRole[decoded.role];
  if (!Model) throw ApiError.unauthorized('Invalid token payload');

  const user = await Model.findById(decoded.id).select('+refreshToken');
  if (!user) throw ApiError.unauthorized('The account associated with this token no longer exists.');
  if (!user.isActive) throw ApiError.forbidden('Your account has been deactivated. Please contact support.');

  // Attach to request
  req.user = user;
  next();
});

module.exports = { authenticate };
