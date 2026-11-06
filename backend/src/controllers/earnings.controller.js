// src/controllers/earnings.controller.js

const DriverEarning = require('../models/DriverEarning.model');
const Driver = require('../models/Driver.model');
const Booking = require('../models/Booking.model');
const Payout = require('../models/Payout.model');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { RIDE_STATUS } = require('../utils/constants');

/**
 * Helper to generate payout ID: PO-YYYYMMDD-XXXX
 */
const generatePayoutId = async () => {
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  const lastPayout = await Payout.findOne({
    payoutId: new RegExp(`^PO-${datePrefix}-`)
  }).sort({ createdAt: -1 });

  let nextSequence = 1;
  if (lastPayout && lastPayout.payoutId) {
    const parts = lastPayout.payoutId.split('-');
    if (parts.length === 3) {
      nextSequence = parseInt(parts[2], 10) + 1;
    }
  }

  return `PO-${datePrefix}-${String(nextSequence).padStart(4, '0')}`;
};

/**
 * @route   GET /api/v1/earnings/driver/dashboard
 * @access  Private (Driver)
 */
const getDriverEarningsDashboard = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const driver = await Driver.findById(driverId).select('walletBalance bankDetails fullName phoneNumber');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Completed bookings by this driver
  const completedRidesQuery = {
    driver: driverId,
    rideStatus: RIDE_STATUS.TRIP_COMPLETED,
  };

  const [
    lifetimeEarningsAgg,
    todayEarningsAgg,
    weeklyEarningsAgg,
    monthlyEarningsAgg,
    todayBookings,
    lifetimeBookings,
    recentEarnings,
    pendingPayoutsAgg,
  ] = await Promise.all([
    // Total net earnings
    DriverEarning.aggregate([
      { $match: { driver: driverId } },
      { $group: { _id: null, totalEarned: { $sum: '$fare' }, netEarnings: { $sum: '$driverEarnings' }, totalCommission: { $sum: '$platformFee' } } }
    ]),
    // Today's earnings
    DriverEarning.aggregate([
      { $match: { driver: driverId, createdAt: { $gte: today } } },
      { $group: { _id: null, netEarnings: { $sum: '$driverEarnings' }, grossFare: { $sum: '$fare' } } }
    ]),
    // Weekly earnings
    DriverEarning.aggregate([
      { $match: { driver: driverId, createdAt: { $gte: startOfWeek } } },
      { $group: { _id: null, netEarnings: { $sum: '$driverEarnings' } } }
    ]),
    // Monthly earnings
    DriverEarning.aggregate([
      { $match: { driver: driverId, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, netEarnings: { $sum: '$driverEarnings' } } }
    ]),
    // Today's completed bookings
    Booking.find({ ...completedRidesQuery, $or: [
      { completedAt: { $gte: today } },
      { rideCompletedAt: { $gte: today } },
      { updatedAt: { $gte: today } }
    ] }),
    // Lifetime completed bookings
    Booking.find(completedRidesQuery).select('bookingId actualDistance estimatedDistance completedAt rideCompletedAt createdAt updatedAt pickupDate finalFare estimatedFare paymentMethod'),
    // Recent transactions
    DriverEarning.find({ driver: driverId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('booking', 'bookingId pickupDate pickupAddress dropAddress finalFare estimatedFare paymentMethod actualDistance estimatedDistance rideStatus'),
    // Pending payouts
    Payout.aggregate([
      { $match: { driver: driverId, status: { $in: ['Pending', 'Processing'] } } },
      { $group: { _id: null, sum: { $sum: '$amount' } } }
    ])
  ]);

  const getRideDistanceKm = (b) => {
    if (typeof b.actualDistance === 'number' && b.actualDistance > 0) return b.actualDistance;
    if (typeof b.estimatedDistance === 'number' && b.estimatedDistance > 0) {
      return b.estimatedDistance > 500 ? b.estimatedDistance / 1000 : b.estimatedDistance;
    }
    return 0;
  };

  const getBookingCompletedDate = (b) => {
    const raw = b.completedAt || b.rideCompletedAt || b.updatedAt || b.createdAt;
    return raw ? new Date(raw) : null;
  };

  // Today calculations
  const todayEarningsVal = todayEarningsAgg[0]?.netEarnings || 0;
  const todayGrossVal = todayEarningsAgg[0]?.grossFare || 0;
  const todayRidesCount = todayBookings.length;
  let todayDistanceKm = 0;
  todayBookings.forEach((b) => {
    todayDistanceKm += getRideDistanceKm(b);
  });

  // Lifetime calculations
  const lifetimeTotal = lifetimeEarningsAgg[0]?.totalEarned || 0;
  const lifetimeNet = lifetimeEarningsAgg[0]?.netEarnings || 0;
  const lifetimeCommission = lifetimeEarningsAgg[0]?.totalCommission || 0;
  const lifetimeRidesCount = lifetimeBookings.length;
  let lifetimeDistanceKm = 0;
  lifetimeBookings.forEach((b) => {
    lifetimeDistanceKm += getRideDistanceKm(b);
  });

  // Last 7 days distance and earnings graph data
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const distanceGraph = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const nextD = new Date(d);
    nextD.setDate(d.getDate() + 1);

    const dayRides = lifetimeBookings.filter((b) => {
      const cDate = getBookingCompletedDate(b);
      return cDate && cDate >= d && cDate < nextD;
    });

    let dayDist = 0;
    let dayEarn = 0;
    dayRides.forEach((r) => {
      dayDist += getRideDistanceKm(r);
      dayEarn += (r.finalFare || r.estimatedFare || 0) * 0.9; // Net estimate
    });

    distanceGraph.push({
      day: daysOfWeek[d.getDay()],
      date: d.toISOString().split('T')[0],
      distanceKm: Math.round(dayDist * 10) / 10,
      earnings: Math.round(dayEarn),
      ridesCount: dayRides.length,
    });
  }

  return sendSuccess(res, 200, 'Driver Earnings Dashboard', {
    wallet: {
      balance: driver?.walletBalance || 0,
      pendingPayouts: pendingPayoutsAgg[0]?.sum || 0,
      bankDetails: driver?.bankDetails || {},
    },
    today: {
      earnings: Math.round(todayEarningsVal),
      grossFare: Math.round(todayGrossVal),
      ridesCount: todayRidesCount,
      distanceKm: Math.round(todayDistanceKm * 10) / 10,
      hoursOnline: Math.min(12, Math.round((todayRidesCount * 0.8 + 1) * 10) / 10), // reasonable estimate
    },
    lifetime: {
      totalEarnings: Math.round(lifetimeTotal),
      netEarnings: Math.round(lifetimeNet),
      commissionPaid: Math.round(lifetimeCommission),
      ridesCount: lifetimeRidesCount,
      distanceKm: Math.round(lifetimeDistanceKm * 10) / 10,
    },
    thisWeek: Math.round(weeklyEarningsAgg[0]?.netEarnings || 0),
    thisMonth: Math.round(monthlyEarningsAgg[0]?.netEarnings || 0),
    distanceGraph,
    recentTransactions: recentEarnings.map((t) => ({
      id: t._id,
      rideId: t.booking?._id || t.booking,
      bookingId: t.booking?.bookingId || 'TRIP',
      amount: t.driverEarnings,
      fare: t.fare,
      commission: t.platformFee,
      paymentMethod: t.booking?.paymentMethod || 'Online',
      route: `${t.booking?.pickupAddress || 'Pickup'} → ${t.booking?.dropAddress || 'Drop'}`,
      date: t.createdAt,
    })),
  });
});

/**
 * @route   POST /api/v1/earnings/driver/payout-request
 * @access  Private (Driver)
 */
const requestPayout = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const { amount, payoutMethod, accountDetails } = req.body;

  const numAmount = Number(amount);
  if (!numAmount || numAmount < 100) {
    throw ApiError.badRequest('Minimum payout request amount is ₹100');
  }

  const driver = await Driver.findById(driverId);
  if (!driver) throw ApiError.notFound('Driver not found');

  if (driver.walletBalance < numAmount) {
    throw ApiError.badRequest(`Insufficient wallet balance. You have ₹${driver.walletBalance.toFixed(2)} available.`);
  }

  // Deduct from wallet balance atomically
  driver.walletBalance -= numAmount;
  if (accountDetails) {
    driver.bankDetails = { ...driver.bankDetails, ...accountDetails };
  }
  await driver.save();

  const payoutId = await generatePayoutId();
  const payout = new Payout({
    payoutId,
    driver: driverId,
    amount: numAmount,
    payoutMethod: payoutMethod || 'Bank Transfer',
    accountDetails: accountDetails || driver.bankDetails || {},
    status: 'Pending',
    requestedAt: new Date(),
  });

  await payout.save();

  return sendSuccess(res, 201, 'Payout request submitted successfully', {
    payout,
    remainingWalletBalance: driver.walletBalance,
  });
});

/**
 * @route   GET /api/v1/earnings/driver/payouts
 * @access  Private (Driver)
 */
const getDriverPayouts = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const payouts = await Payout.find({ driver: driverId }).sort({ requestedAt: -1 });

  return sendSuccess(res, 200, 'Driver payouts fetched', { payouts });
});

/**
 * @route   GET /api/v1/earnings/driver/bank-details
 * @access  Private (Driver)
 */
const getDriverBankDetails = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.user._id).select('bankDetails walletBalance');
  return sendSuccess(res, 200, 'Bank details fetched', {
    bankDetails: driver?.bankDetails || {},
    walletBalance: driver?.walletBalance || 0,
  });
});

/**
 * @route   PUT /api/v1/earnings/driver/bank-details
 * @access  Private (Driver)
 */
const updateDriverBankDetails = asyncHandler(async (req, res) => {
  const { accountHolderName, accountNumber, ifscCode, bankName, upiId } = req.body;
  const driver = await Driver.findById(req.user._id);

  driver.bankDetails = {
    accountHolderName: accountHolderName || driver.bankDetails?.accountHolderName,
    accountNumber: accountNumber || driver.bankDetails?.accountNumber,
    ifscCode: ifscCode || driver.bankDetails?.ifscCode,
    bankName: bankName || driver.bankDetails?.bankName,
    upiId: upiId || driver.bankDetails?.upiId,
  };

  await driver.save();

  return sendSuccess(res, 200, 'Bank details updated successfully', {
    bankDetails: driver.bankDetails,
  });
});

// ── Admin Payout & Earnings Controllers ────────────────────────────────────────

/**
 * @route   GET /api/v1/earnings/admin/payouts
 * @access  Private (Admin)
 */
const getAdminPayouts = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status && status !== 'All') {
    query.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [payouts, total] = await Promise.all([
    Payout.find(query)
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('driver', 'fullName phoneNumber profileImage email walletBalance'),
    Payout.countDocuments(query),
  ]);

  return sendSuccess(res, 200, 'All payout requests', {
    payouts,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

/**
 * @route   PATCH /api/v1/earnings/admin/payouts/:id/status
 * @access  Private (Admin)
 */
const updatePayoutStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, transactionReference, adminNotes, rejectionReason } = req.body;

  const payout = await Payout.findById(id).populate('driver');
  if (!payout) throw ApiError.notFound('Payout request not found');

  const previousStatus = payout.status;
  payout.status = status;

  if (transactionReference) payout.transactionReference = transactionReference;
  if (adminNotes) payout.adminNotes = adminNotes;
  if (rejectionReason) payout.rejectionReason = rejectionReason;

  if (status === 'Paid') {
    payout.processedAt = new Date();
    payout.processedBy = req.user._id;
  } else if (status === 'Rejected' && previousStatus !== 'Rejected') {
    // Refund the amount back to driver wallet
    await Driver.findByIdAndUpdate(payout.driver._id, {
      $inc: { walletBalance: payout.amount }
    });
    payout.processedAt = new Date();
    payout.processedBy = req.user._id;
  }

  await payout.save();

  return sendSuccess(res, 200, `Payout marked as ${status}`, { payout });
});

/**
 * @route   GET /api/v1/earnings/admin/dashboard
 * @access  Private (Admin)
 */
const getAdminEarningsDashboard = asyncHandler(async (req, res) => {
  const [totalPlatformFee, totalDriverPayout, pendingPayouts] = await Promise.all([
    DriverEarning.aggregate([{ $group: { _id: null, sum: { $sum: '$platformFee' } } }]),
    DriverEarning.aggregate([{ $group: { _id: null, sum: { $sum: '$driverEarnings' } } }]),
    Payout.aggregate([
      { $match: { status: 'Pending' } },
      { $group: { _id: null, sum: { $sum: '$amount' }, count: { $sum: 1 } } }
    ])
  ]);

  return sendSuccess(res, 200, 'Admin Earnings Dashboard', {
    totalPlatformRevenue: totalPlatformFee[0] ? totalPlatformFee[0].sum : 0,
    totalDriverPayouts: totalDriverPayout[0] ? totalDriverPayout[0].sum : 0,
    pendingPayouts: {
      amount: pendingPayouts[0]?.sum || 0,
      count: pendingPayouts[0]?.count || 0,
    }
  });
});

module.exports = {
  getDriverEarningsDashboard,
  requestPayout,
  getDriverPayouts,
  getDriverBankDetails,
  updateDriverBankDetails,
  getAdminPayouts,
  updatePayoutStatus,
  getAdminEarningsDashboard,
};
