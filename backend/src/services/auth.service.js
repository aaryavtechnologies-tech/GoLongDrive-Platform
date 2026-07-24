// src/services/auth.service.js
// JWT token generation, verification, and bcrypt utilities.

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');

// ── Token Generation ──────────────────────────────────────────────────────────

/**
 * Generate a short-lived access token.
 * @param {{ id: string, role: string }} payload
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
};

/**
 * Generate a long-lived refresh token.
 * @param {{ id: string, role: string }} payload
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
};

/**
 * Generate both tokens in one call.
 * @param {{ id: string, role: string }} payload
 */
const generateTokenPair = (payload) => ({
  accessToken: generateAccessToken(payload),
  refreshToken: generateRefreshToken(payload),
});

// ── Token Verification ────────────────────────────────────────────────────────

/**
 * Verify an access token.
 * @param {string} token
 * @throws {ApiError} 401 on invalid / expired token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw ApiError.unauthorized('Access token has expired');
    throw ApiError.unauthorized('Invalid access token');
  }
};

/**
 * Verify a refresh token.
 * @param {string} token
 * @throws {ApiError} 401 on invalid / expired token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw ApiError.unauthorized('Refresh token has expired. Please log in again.');
    throw ApiError.unauthorized('Invalid refresh token');
  }
};

// ── Password Reset Token ──────────────────────────────────────────────────────

/**
 * Generate a cryptographically secure reset token.
 * Returns both the raw token (sent in email) and its SHA-256 hash (stored in DB).
 */
const generatePasswordResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return { rawToken, hashedToken, expiry };
};

/**
 * Hash a raw token for safe DB comparison.
 * @param {string} rawToken
 */
const hashToken = (rawToken) =>
  crypto.createHash('sha256').update(rawToken).digest('hex');

// ── Cookie Helper ─────────────────────────────────────────────────────────────

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  generatePasswordResetToken,
  hashToken,
  REFRESH_COOKIE_OPTIONS,
};
