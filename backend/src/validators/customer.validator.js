// src/validators/customer.validator.js
// express-validator rule arrays for each customer API endpoint.

const { body } = require('express-validator');
const {
  emailRule,
  phoneRule,
  strongPasswordRule,
  currentPasswordRule,
  newPasswordRule,
  otpRule,
  tokenRule,
} = require('./auth.validator');

const registerCustomer = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be 2–100 characters'),
  emailRule,
  phoneRule,
  strongPasswordRule,
];

const loginCustomer = [emailRule, body('password').notEmpty().withMessage('Password is required')];

const forgotPassword = [emailRule];

const resetPassword = [
  emailRule,
  otpRule,
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Must contain at least one number')
    .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/).withMessage('Must contain at least one special character'),
];

const sendOTP = [];

const verifyOTP = [otpRule];

const updateProfile = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be 2–100 characters'),
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit Indian mobile number'),
];

const changePassword = [currentPasswordRule, newPasswordRule];

module.exports = {
  registerCustomer,
  loginCustomer,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTP,
  updateProfile,
  changePassword,
};
