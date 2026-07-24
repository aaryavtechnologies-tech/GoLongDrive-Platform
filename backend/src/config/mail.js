// src/config/mail.js
// Resend configuration for sending emails.

const { Resend } = require('resend');

let resendClient = null;

/**
 * Initializes the Resend client.
 * Call once at application startup.
 */
const initMailer = async () => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY is not defined. Emails will fail to send.');
  }
  resendClient = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');
  console.log('✅  Resend client ready');
  return resendClient;
};

/**
 * Returns the active Resend client.
 * Call initMailer() before using this.
 */
const getTransporter = () => {
  if (!resendClient) throw new Error('Mailer not initialised. Call initMailer() first.');
  return resendClient;
};

module.exports = { initMailer, getTransporter };
