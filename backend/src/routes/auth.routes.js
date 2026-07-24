// src/routes/auth.routes.js
// Shared auth endpoints (refresh token) accessible by all roles.

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Shared authentication utilities (refresh token)
 */

const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { verifyRefreshToken, generateAccessToken, REFRESH_COOKIE_OPTIONS } = require('../services/auth.service');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const Customer = require('../models/Customer.model');
const Driver = require('../models/Driver.model');
const Admin = require('../models/Admin.model');
const { ROLES } = require('../utils/constants');

const modelByRole = {
  [ROLES.ADMIN]: Admin,
  [ROLES.CUSTOMER]: Customer,
  [ROLES.DRIVER]: Driver,
};

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Issue a new access token using the refresh token cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  '/refresh-token',
  asyncHandler(async (req, res) => {
    // Accept from httpOnly cookie or request body
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) throw ApiError.unauthorized('Refresh token not provided');

    const decoded = verifyRefreshToken(token);

    const Model = modelByRole[decoded.role];
    if (!Model) throw ApiError.unauthorized('Invalid token payload');

    const user = await Model.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      throw ApiError.unauthorized('Refresh token is invalid or has been revoked');
    }
    if (!user.isActive) throw ApiError.forbidden('Account is deactivated');

    const accessToken = generateAccessToken({ id: user._id, role: user.role });

    return sendSuccess(res, 200, 'Access token refreshed', { accessToken });
  })
);

module.exports = router;
