// src/validators/auth.validator.js
// Reusable express-validator rule sets for email, password, and phone.

const { body } = require('express-validator');

// ── Reusable rules ────────────────────────────────────────────────────────────

const emailRule = body('email')
  .trim()
  .notEmpty().withMessage('Email is required')
  .isEmail().withMessage('Please provide a valid email address')
  .normalizeEmail();

const phoneRule = body('phoneNumber')
  .trim()
  .notEmpty().withMessage('Phone number is required')
  .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit Indian mobile number');

const strongPasswordRule = body('password')
  .notEmpty().withMessage('Password is required')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
  .matches(/\d/).withMessage('Password must contain at least one number')
  .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/).withMessage('Password must contain at least one special character');

const currentPasswordRule = body('currentPassword')
  .notEmpty().withMessage('Current password is required');

const newPasswordRule = body('newPassword')
  .notEmpty().withMessage('New password is required')
  .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
  .matches(/[a-z]/).withMessage('New password must contain at least one lowercase letter')
  .matches(/\d/).withMessage('New password must contain at least one number')
  .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/).withMessage('New password must contain at least one special character');

const otpRule = body('otp')
  .trim()
  .notEmpty().withMessage('OTP is required')
  .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
  .isNumeric().withMessage('OTP must contain only numbers');

const tokenRule = body('token')
  .trim()
  .notEmpty().withMessage('Reset token is required');

module.exports = {
  emailRule,
  phoneRule,
  strongPasswordRule,
  currentPasswordRule,
  newPasswordRule,
  otpRule,
  tokenRule,
};
