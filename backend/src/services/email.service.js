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
      console.error('Resend Error:', response.error);
      console.log(`[Email Fallback] To: ${to} | Subject: ${subject}`);
      return null;
    }
    return response.data;
  } catch (err) {
    console.error('Email sending failed (network/config):', err.message);
    console.log(`[Email Fallback] To: ${to} | Subject: ${subject}`);
    return null;
  }
};

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
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1d4ed8;">Email Verification</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Use the OTP below to verify your email address. It expires in <strong>${expiryMin} minutes</strong>.</p>
      <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1d4ed8;">${otp}</span>
      </div>
      <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      <p style="color: #6b7280; font-size: 14px;">— The Long Distance Taxi Team</p>
    </div>
  `;
  return sendMail({ to, subject, html });
};

/**
 * Send a password reset link via email.
 * @param {string} to         Recipient email
 * @param {string} name       Recipient's full name
 * @param {string} resetLink  Full reset URL (includes raw token)
 */
const sendPasswordResetEmail = async (to, name, resetLink) => {
  const subject = 'Reset Your Password — Long Distance Taxi';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #dc2626;">Password Reset Request</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>We received a request to reset the password for your account. Click the button below to reset it. This link expires in <strong>15 minutes</strong>.</p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetLink}"
           style="background-color: #1d4ed8; color: #fff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p>Or copy this link:<br/><a href="${resetLink}" style="color: #1d4ed8; word-break: break-all;">${resetLink}</a></p>
      <p style="color: #6b7280; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
      <p style="color: #6b7280; font-size: 14px;">— The Long Distance Taxi Team</p>
    </div>
  `;
  return sendMail({ to, subject, html });
};

/**
 * Send a welcome email after successful registration.
 * @param {string} to    Recipient email
 * @param {string} name  Recipient's full name
 */
const sendWelcomeEmail = async (to, name) => {
  const subject = 'Welcome to Long Distance Taxi! 🚕';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #16a34a;">Welcome aboard, ${name}! 🎉</h2>
      <p>Your account has been successfully created on <strong>Long Distance Taxi</strong>.</p>
      <p>You can now book long-distance rides across the country at competitive fares.</p>
      <p style="color: #6b7280; font-size: 14px;">— The Long Distance Taxi Team</p>
    </div>
  `;
  return sendMail({ to, subject, html });
};

/**
 * Send a booking confirmation email.
 * @param {string} to - Recipient email
 * @param {string} name - Recipient's full name
 * @param {Object} booking - Booking details
 */
const sendBookingConfirmationEmail = async (to, name, booking) => {
  const subject = `Booking Confirmed: ${booking.bookingId} — Long Distance Taxi`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #16a34a;">Booking Confirmed! ✅</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your ride booking has been created successfully. We are currently searching for a driver.</p>
      <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
        <p><strong>Pickup:</strong> ${booking.pickupAddress}, ${booking.pickupCity}</p>
        <p><strong>Drop:</strong> ${booking.dropAddress}, ${booking.dropCity}</p>
        <p><strong>Date & Time:</strong> ${new Date(booking.pickupDate).toLocaleDateString()} at ${booking.pickupTime}</p>
        <p><strong>Estimated Fare:</strong> ₹${booking.estimatedFare}</p>
      </div>
      <p>You can track the status in your customer dashboard.</p>
      <p style="color: #6b7280; font-size: 14px;">— The Long Distance Taxi Team</p>
    </div>
  `;
  return sendMail({ to, subject, html });
};

/**
 * Send a booking cancellation email.
 * @param {string} to - Recipient email
 * @param {string} name - Recipient's full name
 * @param {Object} booking - Booking details
 */
const sendBookingCancelledEmail = async (to, name, booking) => {
  const subject = `Booking Cancelled: ${booking.bookingId} — Long Distance Taxi`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #dc2626;">Booking Cancelled ❌</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your ride booking (<strong>${booking.bookingId}</strong>) has been cancelled.</p>
      <p>If you have any questions or if this was a mistake, please contact support.</p>
      <p style="color: #6b7280; font-size: 14px;">— The Long Distance Taxi Team</p>
    </div>
  `;
  return sendMail({ to, subject, html });
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
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #2563eb;">Ride Update 🚕</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>There is an update on your ride (<strong>${booking.bookingId}</strong>):</p>
      <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="font-size: 16px; font-weight: bold; color: #1f2937;">${statusMsg}</p>
      </div>
      <p>Check your dashboard for full details.</p>
      <p style="color: #6b7280; font-size: 14px;">— The Long Distance Taxi Team</p>
    </div>
  `;
  return sendMail({ to, subject, html });
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
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #ea580c;">New Driver Alert 🚘</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Alert regarding ride <strong>${booking.bookingId}</strong>:</p>
      <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="font-size: 16px; font-weight: bold; color: #1f2937;">${statusMsg}</p>
        <p><strong>Pickup:</strong> ${booking.pickupAddress}, ${booking.pickupCity}</p>
        <p><strong>Drop:</strong> ${booking.dropAddress}, ${booking.dropCity}</p>
      </div>
      <p>Please open the driver app to manage your ride.</p>
      <p style="color: #6b7280; font-size: 14px;">— The Long Distance Taxi Team</p>
    </div>
  `;
  return sendMail({ to, subject, html });
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
