// src/controllers/admin.dashboard.controller.js

const { 
  getDashboardOverview, 
  getDashboardCharts, 
  getRecentBookings: getRecentBookingsService, 
  getRecentDrivers: getRecentDriversService, 
  getActivities: getActivitiesService 
} = require('../services/analytics.service');
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

const getCharts = asyncHandler(async (req, res) => {
  const data = await getDashboardCharts();
  return sendSuccess(res, 200, 'Dashboard charts fetched', data);
});

const getRecentBookings = asyncHandler(async (req, res) => {
  const data = await getRecentBookingsService();
  return sendSuccess(res, 200, 'Recent bookings fetched', data);
});

const getRecentDrivers = asyncHandler(async (req, res) => {
  const data = await getRecentDriversService();
  return sendSuccess(res, 200, 'Recent drivers fetched', data);
});

const getActivities = asyncHandler(async (req, res) => {
  const data = await getActivitiesService();
  return sendSuccess(res, 200, 'Activities fetched', data);
});

module.exports = {
  getOverview,
  getCharts,
  getRecentBookings,
  getRecentDrivers,
  getActivities
};
