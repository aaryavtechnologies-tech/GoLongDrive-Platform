// src/controllers/admin.settings.controller.js

const Setting = require('../models/Setting.model');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logAdminAction } = require('../helpers/audit.helper');
const os = require('os');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

/**
 * @route   GET /api/admin/settings
 * @access  Private (Admin)
 */
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({});
  }
  return sendSuccess(res, 200, 'Settings fetched', { settings });
});

/**
 * @route   PUT /api/admin/settings
 * @access  Private (Admin)
 */
const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = new Setting(req.body);
    await settings.save();
  } else {
    // Deep merge to avoid wiping nested settings
    for (const key of Object.keys(req.body)) {
      if (
        typeof req.body[key] === 'object' &&
        req.body[key] !== null &&
        !Array.isArray(req.body[key])
      ) {
        const existing = settings[key]?.toObject ? settings[key].toObject() : (settings[key] || {});
        settings.set(key, { ...existing, ...req.body[key] });
        settings.markModified(key);
      } else {
        settings.set(key, req.body[key]);
      }
    }
    await settings.save();
  }

  // Log the action
  if (req.user?._id) {
    await logAdminAction(
      {
        adminId: req.user._id,
        action: 'Updated Settings',
        module: 'Settings',
        newValue: req.body,
      },
      req
    ).catch(err => console.warn('Could not log admin audit action:', err.message));
  }

  return sendSuccess(res, 200, 'Settings updated successfully', { settings });
});

/**
 * @route   POST /api/admin/settings/email/test
 * @access  Private (Admin)
 */
const testEmailSettings = asyncHandler(async (req, res) => {
  const { host, port, user, pass, secure, testEmail } = req.body;

  let settings = await Setting.findOne();
  const smtp = {
    host: host || settings?.smtpSettings?.host || process.env.SMTP_HOST,
    port: Number(port || settings?.smtpSettings?.port || process.env.SMTP_PORT || 587),
    user: user || settings?.smtpSettings?.user || process.env.SMTP_USER,
    pass: pass || settings?.smtpSettings?.pass || process.env.SMTP_PASS,
    secure: secure !== undefined ? Boolean(secure) : (settings?.smtpSettings?.secure ?? false),
  };

  if (!smtp.host || !smtp.user || !smtp.pass) {
    throw ApiError.badRequest('Incomplete SMTP configuration. Host, username, and password are required.');
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 8000,
    });

    await transporter.verify();

    const recipient = testEmail || req.user?.email || settings?.supportEmail || smtp.user;
    await transporter.sendMail({
      from: `"GoLongDrive Platform" <${smtp.user}>`,
      to: recipient,
      subject: 'GoLongDrive - SMTP Test Email',
      html: `
        <div style="font-family:sans-serif;padding:24px;background:#09090b;color:#ffffff;border-radius:12px;max-width:540px;">
          <h2 style="color:#eab308;margin-top:0;">GoLongDrive Platform</h2>
          <p>Your SMTP mail server configuration is working properly.</p>
          <div style="padding:12px;background:#18181b;border-radius:8px;font-size:12px;color:#a1a1aa;margin-top:16px;">
            <p style="margin:4px 0;"><strong>Host:</strong> ${smtp.host}:${smtp.port}</p>
            <p style="margin:4px 0;"><strong>User:</strong> ${smtp.user}</p>
            <p style="margin:4px 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    });

    return sendSuccess(res, 200, `SMTP connection verified and test email sent to ${recipient}`);
  } catch (err) {
    throw ApiError.badRequest(`SMTP test failed: ${err.message}`);
  }
});

/**
 * @route   GET /api/admin/settings/system/status
 * @access  Private (Admin)
 */
const getSystemStatus = asyncHandler(async (req, res) => {
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const uptime = process.uptime();
  const isConnected = mongoose.connection.readyState === 1;

  const uptimeHours = Math.floor(uptime / 3600);
  const uptimeMinutes = Math.floor((uptime % 3600) / 60);
  const uptimeStr = uptimeHours > 0 ? `${uptimeHours}h ${uptimeMinutes}m` : `${uptimeMinutes}m`;

  const cpus = os.cpus() || [];
  const loadAvg = os.loadavg()[0] || 0;
  const cpuPercent = Math.min(100, Math.round((loadAvg / (cpus.length || 1)) * 100));

  const memPercent = Math.round(((totalMem - freeMem) / totalMem) * 100);

  const systemStatus = {
    Environment: process.env.NODE_ENV || 'production',
    ApplicationVersion: process.env.npm_package_version || '1.0.5',
    DatabaseStatus: isConnected ? 'Healthy' : 'Critical',
    APIStatus: 'Healthy',
    SocketStatus: 'Healthy',
    ServerUptime: uptimeStr,
    StorageUsage: 'Healthy',
    MemoryUsage: `${memPercent}% (${Math.round((totalMem - freeMem) / 1024 / 1024 / 1024)}GB / ${Math.round(totalMem / 1024 / 1024 / 1024)}GB)`,
    CPUUsage: `${cpuPercent}% (${cpus.length} cores)`,
    DiskUsage: 'Normal',
  };

  return sendSuccess(res, 200, 'System status retrieved', systemStatus);
});

module.exports = {
  getSettings,
  updateSettings,
  getSystemStatus,
  testEmailSettings,
};
