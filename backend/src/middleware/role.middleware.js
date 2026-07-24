// src/middleware/role.middleware.js
// Factory that creates role-guard middleware.
// Must be used AFTER authenticate middleware.

const ApiError = require('../utils/ApiError');

/**
 * Returns middleware that allows access only to users with one of the specified roles.
 *
 * Usage:
 *   router.get('/admin-only', authenticate, requireRole('admin'), handler)
 *   router.get('/multi',      authenticate, requireRole('admin', 'driver'), handler)
 *
 * @param {...string} roles  Allowed role names
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  if (!roles.includes(req.user.role)) {
    return next(
      ApiError.forbidden(
        `Access denied. This resource is restricted to: ${roles.join(', ')}.`
      )
    );
  }

  next();
};

module.exports = { requireRole };
