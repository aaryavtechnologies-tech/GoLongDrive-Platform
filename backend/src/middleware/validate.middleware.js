// src/middleware/validate.middleware.js
// Reads express-validator results and returns a 422 response if any errors exist.

const { validationResult } = require('express-validator');
const { sendError } = require('../helpers/response.helper');

/**
 * Must be placed AFTER the express-validator rule arrays in the route chain.
 * Returns 422 with a list of validation errors on failure.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return sendError(res, 422, 'Validation failed', formatted);
  }
  next();
};

module.exports = { validate };
