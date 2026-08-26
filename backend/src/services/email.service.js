// src/services/email.service.js
// All transactional email sending functions using Resend.

const { getTransporter } = require('../config/mail');

const FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev'; // Resend requires a verified domain or onboarding@resend.dev for testing

// ── Internal send helper ──────────────────────────────────────────────────────

const sendMail = async ({ to, subject, html }) => {
  try {
    const resend = getTransporter();
    const response = await resend.emails.send({ from: FROM, to, subject, html });
    if (response.error) {
      console.error('Resend API Error Details:', JSON.stringify(response.error, null, 2));
      console.log(`[Email Fallback] To: ${to} | Subject: ${subject} | (Check Resend Dashboard for "from" address verification)`);
      return null;
    }
    return response.data;
  } catch (err) {
    console.error('Email sending failed (network/config):', err.message);
    if (err.stack) console.error(err.stack);
    console.log(`[Email Fallback] To: ${to} | Subject: ${subject}`);
    return null;
  }
};

// ── Email Wrapper ─────────────────────────────────────────────────────────────

const emailWrapper = (title, content, preheader = '') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 40px auto; background-color: #111827; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); color: #f9fafb; }
    .header { background-color: #facc15; padding: 24px; text-align: center; }
    .header h1 { margin: 0; color: #111827; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 32px; }
    .content h2 { color: #facc15; margin-top: 0; font-size: 20px; border-bottom: 2px solid #374151; padding-bottom: 12px; }
    .content p { font-size: 16px; line-height: 1.6; color: #d1d5db; margin-bottom: 16px; }
    .content strong { color: #f9fafb; font-weight: 600; }
    .box { background-color: #1f2937; border-left: 4px solid #facc15; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0; }
    .box p { margin: 8px 0; }
    .box p:first-child { margin-top: 0; }
    .box p:last-child { margin-bottom: 0; }
    .btn-container { text-align: center; margin: 32px 0; }
    .button { display: inline-block; background-color: #facc15; color: #111827 !important; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { background-color: #030712; padding: 24px; text-align: center; font-size: 13px; color: #6b7280; }
    .footer p { margin: 8px 0; }
    .footer a { color: #facc15; text-decoration: none; }
    .highlight-text { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #facc15; text-align: center; display: block; margin: 10px 0; }
  </style>
</head>
<body>
  ${preheader ? `<span style="display:none;font-size:1px;color:#f3f4f6;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>` : ''}
  <div class="container">
    <div class="header">
      <h1>Long Distance Taxi 🚕</h1>
    </div>
    <div class="content">
      <h2>${title}</h2>
      ${content}
    </div>
    <div class="footer">
      <p>Need help? Contact our <a href="#">support team</a>.</p>
      <p>&copy; ${new Date().getFullYear()} Long Distance Taxi. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// ── Email Templates ───────────────────────────────────────────────────────────

/**
 * Send a 6-digit OTP email for email verification.
 * @param {string} to         Recipient email
 * @param {string} name       Recipient's full name
 * @param {string} otp        Plain-text OTP
 * @param {number} expiryMin  Minutes until OTP expires
 */
const sendOTPEmail = async (to, name, otp, expiryMin = 10) => {
  const subject = 'Verify Your Email — Long Distance Taxi';
  const content = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Use the OTP below to verify your email address. It expires in <strong>${expiryMin} minutes</strong>.</p>
    <div class="box" style="text-align: center;">
      <span class="highlight-text">${otp}</span>
    </div>
    <p>If you didn't request this, please ignore this email.</p>
    <p>— The Long Distance Taxi Team</p>
  `;
  return sendMail({ to, subject, html: emailWrapper('Email Verification', content, 'Your OTP for Long Distance Taxi') });
};

/**
 * Send a password reset link via email.
 * @param {string} to         Recipient email
 * @param {string} name       Recipient's full name
 * @param {string} resetLink  Full reset URL (includes raw token)
 */
const sendPasswordResetEmail = async (to, name, resetLink) => {
  const subject = 'Reset Your Password — Long Distance Taxi';
  const content = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>We received a request to reset the password for your account. Click the button below to reset it. This link expires in <strong>15 minutes</strong>.</p>
    <div class="btn-container">
      <a href="${resetLink}" class="button">Reset Password</a>
    </div>
    <p style="font-size: 14px;">Or copy this link into your browser:<br/><a href="${resetLink}" style="color: #facc15; word-break: break-all;">${resetLink}</a></p>
    <p>If you didn't request a password reset, you can safely ignore this email.</p>
    <p>— The Long Distance Taxi Team</p>
  `;
  return sendMail({ to, subject, html: emailWrapper('Password Reset Request', content, 'Reset your Long Distance Taxi password') });
};

/**
 * Send a welcome email after successful registration.
 * @param {string} to    Recipient email
 * @param {string} name  Recipient's full name
 */
const sendWelcomeEmail = async (to, name) => {
  const subject = 'Welcome to Long Distance Taxi! 🚕';
  const content = `
    <p>Welcome aboard, <strong>${name}</strong>! 🎉</p>
    <p>Your account has been successfully created on Long Distance Taxi.</p>
    <div class="box">
      <p>Get ready to book comfortable and reliable long-distance rides across the country at competitive fares. Your journey starts here!</p>
    </div>
    <p>— The Long Distance Taxi Team</p>
  `;
  return sendMail({ to, subject, html: emailWrapper('Welcome to the Family!', content, 'Your account is ready to go') });
};

/**
 * Send a booking confirmation email.
 * @param {string} to - Recipient email
 * @param {string} name - Recipient's full name
 * @param {Object} booking - Booking details
 */
const sendBookingConfirmationEmail = async (to, name, booking) => {
  const subject = `Booking Confirmed: ${booking.bookingId} — Long Distance Taxi`;
  const content = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your ride booking has been created successfully. We are currently searching for a driver for your trip.</p>
    <div class="box">
      <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
      <p><strong>Pickup:</strong> ${booking.pickupAddress}, ${booking.pickupCity}</p>
      <p><strong>Drop:</strong> ${booking.dropAddress}, ${booking.dropCity}</p>
      <p><strong>Date & Time:</strong> ${new Date(booking.pickupDate).toLocaleDateString()} at ${booking.pickupTime}</p>
      <p><strong>Estimated Fare:</strong> ₹${booking.estimatedFare}</p>
    </div>
    <p>You can track the status of your ride directly in your customer dashboard.</p>
    <p>— The Long Distance Taxi Team</p>
  `;
  return sendMail({ to, subject, html: emailWrapper('Booking Confirmed ✅', content, 'Your ride request has been received') });
};

/**
 * Send a booking cancellation email.
 * @param {string} to - Recipient email
 * @param {string} name - Recipient's full name
 * @param {Object} booking - Booking details
 */
const sendBookingCancelledEmail = async (to, name, booking) => {
  const subject = `Booking Cancelled: ${booking.bookingId} — Long Distance Taxi`;
  const content = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your ride booking (<strong>${booking.bookingId}</strong>) has been cancelled.</p>
    <div class="box" style="border-left-color: #ef4444;">
      <p>If you have any questions, require a refund, or if this cancellation was a mistake, please contact our support team immediately.</p>
    </div>
    <p>— The Long Distance Taxi Team</p>
  `;
  return sendMail({ to, subject, html: emailWrapper('Booking Cancelled ❌', content, 'Important update regarding your ride') });
};

/**
 * Send generic ride status update to Customer
 * @param {string} to - Recipient email
 * @param {string} name - Recipient's full name
 * @param {Object} booking - Booking details
 * @param {string} statusMsg - The status update message
 */
const sendRideStatusCustomerEmail = async (to, name, booking, statusMsg) => {
  const subject = `Ride Update: ${booking.bookingId} — Long Distance Taxi`;
  const content = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>There is a new update regarding your ride (<strong>${booking.bookingId}</strong>):</p>
    <div class="box">
      <p style="font-size: 18px; color: #facc15; font-weight: bold; text-align: center; margin: 0;">${statusMsg}</p>
    </div>
    <p>Please check your dashboard for full details and driver information.</p>
    <p>— The Long Distance Taxi Team</p>
  `;
  return sendMail({ to, subject, html: emailWrapper('Ride Update 🚕', content, 'Status update for your current ride') });
};

/**
 * Send generic ride status update to Driver
 * @param {string} to - Recipient email
 * @param {string} name - Recipient's full name
 * @param {Object} booking - Booking details
 * @param {string} statusMsg - The status update message
 */
const sendRideStatusDriverEmail = async (to, name, booking, statusMsg) => {
  const subject = `Ride Alert: ${booking.bookingId} — Long Distance Taxi`;
  const content = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>You have a new alert regarding ride <strong>${booking.bookingId}</strong>:</p>
    <div class="box">
      <p style="font-size: 18px; color: #facc15; font-weight: bold; margin-top: 0;">${statusMsg}</p>
      <p><strong>Pickup:</strong> ${booking.pickupAddress}, ${booking.pickupCity}</p>
      <p><strong>Drop:</strong> ${booking.dropAddress}, ${booking.dropCity}</p>
    </div>
    <p>Please open your driver app to manage this ride and view complete details.</p>
    <p>— The Long Distance Taxi Team</p>
  `;
  return sendMail({ to, subject, html: emailWrapper('New Driver Alert 🚘', content, 'Action required for an assigned ride') });
};

module.exports = { 
  sendOTPEmail, 
  sendPasswordResetEmail, 
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
  sendBookingCancelledEmail,
  sendRideStatusCustomerEmail,
  sendRideStatusDriverEmail
};
