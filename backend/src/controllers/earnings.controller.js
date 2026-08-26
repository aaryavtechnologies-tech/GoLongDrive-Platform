// src/controllers/earnings.controller.js

const DriverEarning = require('../models/DriverEarning.model');
const { sendSuccess } = require('../helpers/response.helper');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/driver/earnings/dashboard
 * @access  Private (Driver)
 */
const getDriverEarningsDashboard = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date();
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [total, todayEarnings, weeklyEarnings, monthlyEarnings, recentTransactions] = await Promise.all([
    DriverEarning.aggregate([{ $match: { driver: driverId } }, { $group: { _id: null, sum: { $sum: '$driverEarnings' } } }]),
    DriverEarning.aggregate([{ $match: { driver: driverId, createdAt: { $gte: today } } }, { $group: { _id: null, sum: { $sum: '$driverEarnings' } } }]),
    DriverEarning.aggregate([{ $match: { driver: driverId, createdAt: { $gte: startOfWeek } } }, { $group: { _id: null, sum: { $sum: '$driverEarnings' } } }]),
    DriverEarning.aggregate([{ $match: { driver: driverId, createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, sum: { $sum: '$driverEarnings' } } }]),
    DriverEarning.find({ driver: driverId }).sort({ createdAt: -1 }).limit(5).populate('booking', 'bookingId pickupDate fare')
  ]);

  return sendSuccess(res, 200, 'Driver Earnings Dashboard', {
    total: total[0] ? total[0].sum : 0,
    todayEarnings: todayEarnings[0] ? todayEarnings[0].sum : 0,
    weekly: weeklyEarnings[0] ? weeklyEarnings[0].sum : 0,
    monthly: monthlyEarnings[0] ? monthlyEarnings[0].sum : 0,
    recentTransactions: recentTransactions.map(t => ({
      id: t._id,
      type: 'Ride Earnings',
      amount: t.driverEarnings,
      date: t.createdAt,
      bookingId: t.booking?.bookingId
    }))
  });
});

/**
 * @route   GET /api/admin/earnings/dashboard
 * @access  Private (Admin)
 */
const getAdminEarningsDashboard = asyncHandler(async (req, res) => {
  const [totalPlatformFee, totalDriverPayout] = await Promise.all([
    DriverEarning.aggregate([{ $group: { _id: null, sum: { $sum: '$platformFee' } } }]),
    DriverEarning.aggregate([{ $group: { _id: null, sum: { $sum: '$driverEarnings' } } }])
  ]);

  return sendSuccess(res, 200, 'Admin Earnings Dashboard', {
    totalPlatformRevenue: totalPlatformFee[0] ? totalPlatformFee[0].sum : 0,
    totalDriverPayouts: totalDriverPayout[0] ? totalDriverPayout[0].sum : 0,
  });
});

module.exports = {
  getDriverEarningsDashboard,
  getAdminEarningsDashboard
};
