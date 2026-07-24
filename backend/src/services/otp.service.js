// src/services/otp.service.js
// OTP generation, hashing, and verification utilities.

const crypto = require('crypto');
const { OTP_EXPIRY_MINUTES } = require('../utils/constants');

/**
 * Generate a random 6-digit numeric OTP.
 * @returns {string}
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash an OTP with SHA-256 before storing it in the database.
 * @param {string} otp  Raw OTP string
 * @returns {string}    Hex digest
 */
const hashOTP = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

/**
 * Get the OTP expiry Date object (current time + OTP_EXPIRY_MINUTES).
 * @returns {Date}
 */
const getOTPExpiry = () => new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

/**
 * Verify that the supplied OTP matches the stored hash and has not expired.
 *
 * @param {string} suppliedOTP   OTP entered by the user (plain text)
 * @param {string} storedHash    Hashed OTP from the database
 * @param {Date}   expiryDate    Expiry timestamp from the database
 * @returns {{ valid: boolean, expired: boolean }}
 */
const verifyOTP = (suppliedOTP, storedHash, expiryDate) => {
  const expired = new Date() > new Date(expiryDate);
  if (expired) return { valid: false, expired: true };

  const suppliedHash = hashOTP(suppliedOTP);
  const valid = suppliedHash === storedHash;
  return { valid, expired: false };
};

module.exports = { generateOTP, hashOTP, getOTPExpiry, verifyOTP };
