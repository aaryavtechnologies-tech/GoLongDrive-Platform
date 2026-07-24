// src/controllers/admin.dashboard.controller.js

const { getDashboardOverview } = require('../services/analytics.service');
const { sendSuccess } = require('../helpers/response.helper');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/admin/dashboard/overview
 * @access  Private (Admin)
 */
const getOverview = asyncHandler(async (req, res) => {
  const data = await getDashboardOverview();
  return sendSuccess(res, 200, 'Dashboard overview fetched', data);
});

module.exports = {
  getOverview
};
