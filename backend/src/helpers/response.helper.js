// src/helpers/response.helper.js
// Provides a unified JSON response shape for all API endpoints.
//
// Success:  { success: true,  message, data }
// Error:    { success: false, message, errors? }

/**
 * Send a standardised success response.
 *
 * @param {import('express').Response} res
 * @param {number}  statusCode  HTTP status code (default 200)
 * @param {string}  message     Human-readable success message
 * @param {any}     data        Response payload
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const payload = { success: true, message };
  if (data !== null && data !== undefined) payload.data = data;
  return res.status(statusCode).json(payload);
};

/**
 * Send a standardised error response.
 *
 * @param {import('express').Response} res
 * @param {number}   statusCode  HTTP status code (default 500)
 * @param {string}   message     Human-readable error message
 * @param {any[]}    errors      Optional array of field-level errors
 */
const sendError = (res, statusCode = 500, message = 'Something went wrong', errors = []) => {
  const payload = { success: false, message };
  if (errors && errors.length > 0) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

module.exports = { sendSuccess, sendError };
