// src/controllers/admin.settings.controller.js

const Setting = require('../models/Setting.model');
const { sendSuccess } = require('../helpers/response.helper');
const asyncHandler = require('../utils/asyncHandler');
const { logAdminAction } = require('../helpers/audit.helper');

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

module.exports = {
  getSettings,
  updateSettings
};
