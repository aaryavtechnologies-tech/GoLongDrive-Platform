// src/utils/asyncHandler.js
// Wraps an async Express route handler so that any rejected promise
// is forwarded to Express's next(err) error pipeline automatically.

/**
 * @param {Function} fn  Async route handler (req, res, next) => Promise
 * @returns {Function}   Express-compatible middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
