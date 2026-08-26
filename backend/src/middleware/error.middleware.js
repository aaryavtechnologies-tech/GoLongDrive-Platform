// src/middleware/error.middleware.js
// Centralised error handler and 404 handler for Express.

const { sendError } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');

// ── 404 Handler ───────────────────────────────────────────────────────────────

/**
 * Catches any request that did not match a defined route.
 */
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// ── Global Error Handler ──────────────────────────────────────────────────────

/**
 * Handles all errors forwarded via next(err).
 * Returns a consistent JSON error response.
 */
// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, next) => {
  // Log the error
  if (process.env.NODE_ENV !== 'test') {
    if (err.statusCode !== 401 && err.message !== 'Access token has expired') {
      console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);
    }
    if (!err.isOperational) console.error(err.stack);
  }

  // ── Mongoose / JWT / Multer error normalisation ──────────────────────────

  let error = err;

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    error = ApiError.badRequest(`Invalid value for field: ${err.path}`);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    let friendlyField = field || 'record';
    
    // Map common database fields to user-friendly terms
    if (field === 'email') friendlyField = 'email address';
    if (field === 'phoneNumber') friendlyField = 'phone number';
    if (field === 'userId' || field === 'driverId' || field === 'customerId') friendlyField = 'account details';

    error = ApiError.conflict(
      `An account or record with this ${friendlyField} already exists.`
    );
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = ApiError.badRequest('Validation failed', messages);
  }

  // JWT errors (fallback, usually caught in auth.middleware)
  if (err.name === 'JsonWebTokenError') error = ApiError.unauthorized('Invalid token');
  if (err.name === 'TokenExpiredError') error = ApiError.unauthorized('Token has expired');

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = ApiError.badRequest(`File too large. Maximum allowed size is 10 MB.`);
  }

  // ── Send response ─────────────────────────────────────────────────────────

  const statusCode = error.statusCode || 500;
  const message =
    error.isOperational
      ? error.message
      : process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again later.'
        : err.message;

  return sendError(res, statusCode, message, error.errors || []);
};

module.exports = { notFoundHandler, globalErrorHandler };
