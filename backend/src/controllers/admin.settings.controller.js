// src/controllers/admin.settings.controller.js

const Setting = require('../models/Setting.model');
const { sendSuccess } = require('../helpers/response.helper');
const asyncHandler = require('../utils/asyncHandler');
const { logAdminAction } = require('../helpers/audit.helper');
const os = require('os');
const mongoose = require('mongoose');

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
    settings = await Setting.findByIdAndUpdate(settings._id, req.body, { new: true, runValidators: true });
  }

  // Log the action
  await logAdminAction({
    adminId: req.user._id,
    action: 'Updated Settings',
    module: 'Settings',
    newValue: req.body
  }, req);

  return sendSuccess(res, 200, 'Settings updated successfully', { settings });
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

  // Assuming node API status and Socket status are OK if process is running
  const systemStatus = {
    Environment: process.env.NODE_ENV || 'development',
    ApplicationVersion: process.env.npm_package_version || '1.0.0',
    DatabaseStatus: isConnected ? 'Healthy' : 'Critical',
    APIStatus: 'Healthy',
    SocketStatus: 'Healthy',
    ServerUptime: `${Math.floor(uptime / 60)} mins`,
    StorageUsage: 'N/A', // Assuming not tracked right now
    MemoryUsage: `${Math.round((totalMem - freeMem) / totalMem * 100)}%`,
    CPUUsage: `${Math.round(os.loadavg()[0] * 100)}%`,
    DiskUsage: 'N/A' // Could use a package for this if needed
  };

  return sendSuccess(res, 200, 'System status retrieved', systemStatus);
});

module.exports = {
  getSettings,
  updateSettings,
  getSystemStatus
};
