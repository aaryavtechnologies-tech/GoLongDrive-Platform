// src/services/email.service.js
// All transactional email sending functions using Resend.

const { getTransporter } = require('../config/mail');

const FROM = process.env.EMAIL_FROM || 'GoLongDrive <onboarding@resend.dev>';
const PLATFORM_NAME = 'GoLongDrive';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@golongdrive.online';

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

// ── Modern Bulletproof Email Wrapper ──────────────────────────────────────────

const emailWrapper = (title, content, preheader = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title} — ${PLATFORM_NAME}</title>
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }

    /* Container */
    .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 40px 0; }
    .main-card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0; }

    /* Header */
    .header { background: linear-gradient(135deg, #14493f 0%, #267568 100%); padding: 36px 32px 30px; text-align: center; }
    .brand-pill { display: inline-block; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 30px; padding: 4px 14px; font-size: 11px; font-weight: 700; color: #facc15; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; }
    .header h1 { margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: 0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.15); }
    .header .subtitle { color: #e2e8f0; font-size: 13px; margin-top: 6px; font-weight: 500; letter-spacing: 0.5px; }

    /* Content Area */
    .content-body { padding: 36px 32px; background-color: #ffffff; color: #334155; }
    .content-title { color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 18px; padding-bottom: 12px; border-bottom: 2px solid #f1f5f9; }
    .content-body p { font-size: 15px; line-height: 1.65; color: #475569; margin: 0 0 16px; }
    .content-body strong { color: #0f172a; font-weight: 700; }

    /* Highlight Card / Info Box */
    .info-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #267568; border-radius: 10px; padding: 20px; margin: 24px 0; }
    .info-card p { margin: 8px 0; font-size: 14px; color: #334155; }
    .info-card p:first-child { margin-top: 0; }
    .info-card p:last-child { margin-bottom: 0; }

    /* OTP Code Display Box */
    .otp-container { text-align: center; margin: 28px 0; }
    .otp-box { display: inline-block; background: #f0fdf4; border: 2px dashed #267568; border-radius: 14px; padding: 18px 36px; }
    .otp-code { font-family: 'SF Mono', 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #1d6055; display: block; margin: 0; text-indent: 10px; }
    .otp-expiry { display: inline-block; font-size: 12px; font-weight: 600; color: #059669; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.8px; }

    /* Action Button */
    .btn-container { text-align: center; margin: 32px 0; }
    .btn-primary { display: inline-block; background-color: #267568; color: #ffffff !important; text-decoration: none; padding: 15px 36px; border-radius: 10px; font-weight: 700; font-size: 15px; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(38, 117, 104, 0.35); text-align: center; transition: background-color 0.2s; }
    .btn-primary:hover { background-color: #1d6055; }

    /* Key-Value Details Table */
    .details-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .details-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .details-table td.label { color: #64748b; font-weight: 600; width: 35%; }
    .details-table td.value { color: #0f172a; font-weight: 600; }

    /* Footer */
    .footer { background-color: #0f172a; padding: 30px 24px; text-align: center; color: #94a3b8; font-size: 13px; line-height: 1.6; }
    .footer p { margin: 6px 0; }
    .footer a { color: #38bdf8; text-decoration: none; font-weight: 500; }
    .footer .copyright { color: #64748b; font-size: 12px; margin-top: 14px; }
    .footer .security-notice { font-size: 11px; color: #475569; margin-top: 12px; }
  </style>
</head>
<body>
  ${preheader ? `<span style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>` : ''}
  <div class="wrapper">
    <div class="main-card">
      <div class="header">
        <div class="brand-pill">PREMIUM CAB NETWORK</div>
        <h1>${PLATFORM_NAME}</h1>
        <div class="subtitle">Intercity Rides & Tour Packages</div>
      </div>
      <div class="content-body">
        <h2 class="content-title">${title}</h2>
        ${content}
      </div>
      <div class="footer">
        <p>Need assistance? Contact our team at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
        <p class="copyright">&copy; ${new Date().getFullYear()} ${PLATFORM_NAME} Technologies. All rights reserved.</p>
        <p class="security-notice">This is an automated operational notification regarding your ${PLATFORM_NAME} account or booking.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// ── Email Templates ───────────────────────────────────────────────────────────

/**
 * Send a 6-digit OTP email for email verification.
 */
const sendOTPEmail = async (to, name, otp, expiryMin = 10) => {
  const subject = `Verify Your Email — ${PLATFORM_NAME}`;
  const content = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Thank you for signing up with <strong>${PLATFORM_NAME}</strong>. Please use the One-Time Password (OTP) below to verify your email address and activate your account.</p>
    
    <div class="otp-container">
      <div class="otp-box">
        <span class="otp-code">${otp}</span>
        <div class="otp-expiry">⏱ Expires in ${expiryMin} minutes</div>
      </div>
    </div>

    <p style="font-size: 13px; color: #64748b;">For your security, never share this OTP with anyone, including ${PLATFORM_NAME} staff or drivers.</p>
    <p>If you did not request this verification, please disregard this email.</p>
    <br/>
    <p>Warm regards,<br/><strong>The ${PLATFORM_NAME} Team</strong></p>
  `;
  return sendMail({
    to,
    subject,
    html: emailWrapper('Email Verification', content, `Your OTP for ${PLATFORM_NAME} is ${otp}`),
  });
};

/**
 * Send a password reset link via email.
 */
const sendPasswordResetEmail = async (to, name, resetLink) => {
  const subject = `Reset Your Password — ${PLATFORM_NAME}`;
  const content = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>We received a request to reset the password for your <strong>${PLATFORM_NAME}</strong> account. Click the button below to choose a new password.</p>
    
    <div class="btn-container">
      <a href="${resetLink}" class="btn-primary" target="_blank">Reset My Password</a>
    </div>

    <div class="info-card">
      <p><strong>Note:</strong> This password reset link is valid for <strong>15 minutes</strong> and can only be used once.</p>
    </div>

    <p style="font-size: 13px; color: #64748b; word-break: break-all;">
      If the button above does not work, copy and paste this link into your browser:<br/>
      <a href="${resetLink}" style="color: #267568;">${resetLink}</a>
    </p>

    <p style="font-size: 13px; color: #64748b;">If you did not request a password reset, you can safely ignore this email — your account remains secure.</p>
    <br/>
    <p>Warm regards,<br/><strong>The ${PLATFORM_NAME} Team</strong></p>
  `;
  return sendMail({
    to,
    subject,
    html: emailWrapper('Password Reset Request', content, `Reset your ${PLATFORM_NAME} password`),
  });
};

/**
 * Send a welcome email after successful registration.
 */
const sendWelcomeEmail = async (to, name) => {
  const subject = `Welcome to ${PLATFORM_NAME}! 🚗`;
  const content = `
    <p>Welcome aboard, <strong>${name}</strong>! 🎉</p>
    <p>Your account on <strong>${PLATFORM_NAME}</strong> has been successfully created and verified.</p>
    
    <div class="info-card">
      <p style="font-weight: 700; font-size: 15px; color: #267568; margin-bottom: 6px;">What you can do with ${PLATFORM_NAME}:</p>
      <p>✨ <strong>Long-Distance Outstation Rides:</strong> Book comfortable sedans, SUVs, and premium cabs across cities with verified drivers.</p>
      <p>🏔️ <strong>Tour & Holiday Packages:</strong> Explore curated multi-day tour itineraries with dedicated vehicles.</p>
      <p>🛡️ <strong>Safety First:</strong> Live GPS tracking, verified driver PIN matching, and round-the-clock support.</p>
    </div>

    <p>Open the app now to plan your next journey!</p>
    <br/>
    <p>Safe travels,<br/><strong>The ${PLATFORM_NAME} Team</strong></p>
  `;
  return sendMail({
    to,
    subject,
    html: emailWrapper('Welcome to the Family!', content, `Your ${PLATFORM_NAME} account is ready`),
  });
};

/**
 * Send a booking confirmation email.
 */
const sendBookingConfirmationEmail = async (to, name, booking) => {
  const subject = `Booking Confirmed: ${booking.bookingId} — ${PLATFORM_NAME}`;
  const formattedDate = booking.pickupDate ? new Date(booking.pickupDate).toLocaleDateString() : 'Confirmed Date';
  const fare = booking.estimatedFare || booking.finalFare || 0;

  const content = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your ride booking has been confirmed successfully! Our system is matching the best verified driver for your journey.</p>
    
    <div class="info-card">
      <table class="details-table">
        <tr>
          <td class="label">Booking ID</td>
          <td class="value" style="color: #267568;">${booking.bookingId}</td>
        </tr>
        <tr>
          <td class="label">Pickup Location</td>
          <td class="value">${booking.pickupAddress || 'Pickup Point'}, ${booking.pickupCity || ''}</td>
        </tr>
        <tr>
          <td class="label">Drop Location</td>
          <td class="value">${booking.dropAddress || 'Destination'}, ${booking.dropCity || ''}</td>
        </tr>
        <tr>
          <td class="label">Date & Time</td>
          <td class="value">${formattedDate} at ${booking.pickupTime || 'Scheduled Time'}</td>
        </tr>
        <tr>
          <td class="label">Vehicle Type</td>
          <td class="value">${booking.vehicleType || 'Cab'}</td>
        </tr>
        <tr>
          <td class="label">Estimated Fare</td>
          <td class="value" style="font-size: 16px; color: #0f172a;">₹${fare}</td>
        </tr>
      </table>
    </div>

    <p>You can track driver assignment and ride status in real time right inside your <strong>${PLATFORM_NAME}</strong> app.</p>
    <br/>
    <p>Thank you for choosing us,<br/><strong>The ${PLATFORM_NAME} Team</strong></p>
  `;
  return sendMail({
    to,
    subject,
    html: emailWrapper('Booking Confirmed ✅', content, `Ride confirmed: ${booking.bookingId}`),
  });
};

/**
 * Send a booking cancellation email.
 */
const sendBookingCancelledEmail = async (to, name, booking) => {
  const subject = `Booking Cancelled: ${booking.bookingId} — ${PLATFORM_NAME}`;
  const content = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your ride booking with ID <strong>${booking.bookingId}</strong> has been cancelled.</p>
    
    <div class="info-card" style="border-left-color: #ef4444; background-color: #fef2f2;">
      <p style="color: #991b1b; font-weight: 600;">Status: Ride Cancelled</p>
      <p style="color: #7f1d1d;">If this was unexpected, or if you made an advance payment and require assistance with your refund, our support team is available 24/7.</p>
    </div>

    <p>You can rebook a fresh ride whenever you are ready directly from the <strong>${PLATFORM_NAME}</strong> app.</p>
    <br/>
    <p>Warm regards,<br/><strong>The ${PLATFORM_NAME} Team</strong></p>
  `;
  return sendMail({
    to,
    subject,
    html: emailWrapper('Booking Cancelled ❌', content, `Booking ${booking.bookingId} cancelled`),
  });
};

/**
 * Send generic ride status update to Customer
 */
const sendRideStatusCustomerEmail = async (to, name, booking, statusMsg) => {
  const subject = `Ride Update: ${booking.bookingId} — ${PLATFORM_NAME}`;
  const content = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Here is an update regarding your booking <strong>${booking.bookingId}</strong>:</p>
    
    <div class="info-card">
      <p style="font-size: 17px; color: #267568; font-weight: 800; text-align: center; margin: 4px 0;">
        ${statusMsg}
      </p>
    </div>

    <p>Please open the <strong>${PLATFORM_NAME}</strong> app for live GPS tracking and full driver information.</p>
    <br/>
    <p>Warm regards,<br/><strong>The ${PLATFORM_NAME} Team</strong></p>
  `;
  return sendMail({
    to,
    subject,
    html: emailWrapper('Ride Update 🚗', content, `${statusMsg} — ${booking.bookingId}`),
  });
};

/**
 * Send generic ride status update to Driver
 */
const sendRideStatusDriverEmail = async (to, name, booking, statusMsg) => {
  const subject = `Ride Alert: ${booking.bookingId} — ${PLATFORM_NAME}`;
  const content = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>You have a new dispatch notification for trip <strong>${booking.bookingId}</strong>:</p>
    
    <div class="info-card">
      <p style="font-size: 17px; color: #267568; font-weight: 800; margin-top: 0;">${statusMsg}</p>
      <p><strong>Pickup:</strong> ${booking.pickupAddress || ''}, ${booking.pickupCity || ''}</p>
      <p><strong>Drop:</strong> ${booking.dropAddress || ''}, ${booking.dropCity || ''}</p>
    </div>

    <p>Please launch your <strong>${PLATFORM_NAME} Driver App</strong> to manage this ride.</p>
    <br/>
    <p>Stay safe,<br/><strong>The ${PLATFORM_NAME} Team</strong></p>
  `;
  return sendMail({
    to,
    subject,
    html: emailWrapper('Driver Dispatch Alert 🚘', content, `Action required for ${booking.bookingId}`),
  });
};

module.exports = {
  sendMail,
  sendOTPEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
  sendBookingCancelledEmail,
  sendRideStatusCustomerEmail,
  sendRideStatusDriverEmail,
};
