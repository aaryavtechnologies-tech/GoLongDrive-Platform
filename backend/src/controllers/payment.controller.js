// src/controllers/payment.controller.js

const mongoose = require('mongoose');
const { createPaymentOrder, verifyPaymentTransaction } = require('../services/payment.service');
const { generateInvoice } = require('../services/invoice.service');
const { emitBookingEvent } = require('../services/booking.service');
const Booking = require('../models/Booking.model');
const Payment = require('../models/Payment.model');
const DriverEarning = require('../models/DriverEarning.model');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { PAYMENT_METHODS } = require('../utils/constants');

/**
 * @route   POST /api/customer/payments/order
 * @access  Private (Customer)
 */
const createOrder = asyncHandler(async (req, res) => {
  const { bookingId, paymentMethod } = req.body;
  const customerId = req.user._id;

  let booking = null;
  if (mongoose.Types.ObjectId.isValid(bookingId)) {
    booking = await Booking.findById(bookingId);
  }
  if (!booking) {
    booking = await Booking.findOne({ bookingId: String(bookingId) });
  }
  if (!booking) throw ApiError.notFound('Booking not found');
  if (booking.customer.toString() !== customerId.toString()) {
    throw ApiError.forbidden('Access denied');
  }

  const { payment, orderDetails } = await createPaymentOrder({
    bookingId: booking._id,
    customerId,
    amount: booking.finalFare > 0 ? booking.finalFare : booking.estimatedFare,
    paymentMethod,
  });

  return sendSuccess(res, 200, 'Payment order created', {
    paymentId: payment.paymentId,
    order: orderDetails,
  });
});

/**
 * @route   POST /api/customer/payments/verify
 * @access  Private (Customer)
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentId, gatewayOrderId, gatewayPaymentId, gatewaySignature } = req.body;

  const payment = await verifyPaymentTransaction(
    paymentId,
    gatewayOrderId,
    gatewayPaymentId,
    gatewaySignature
  );

  // Generate invoice asynchronously upon successful payment
  if (payment.paymentStatus === 'Paid') {
    generateInvoice(payment.booking, payment._id).catch(err => console.error('Invoice generation failed:', err));
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.paymentStatus = 'Paid';
      booking.rideStatus = 'Trip Completed';
      booking.completedAt = new Date();
      await booking.save();

      // Free driver and calculate earnings
      if (booking.driver) {
        const Driver = require('../models/Driver.model');
        const { AVAILABILITY_STATUS } = require('../utils/constants');
        await Driver.findByIdAndUpdate(booking.driver, { availabilityStatus: AVAILABILITY_STATUS.AVAILABLE });

        const { generateEarningRecord } = require('../services/earning.service');
        const Setting = require('../models/Setting.model');
        const settings = await Setting.findOne();
        const feePercent = settings?.platformFeePercentage || 10;
        const platformFee = (booking.finalFare > 0 ? booking.finalFare : booking.estimatedFare) * (feePercent / 100);
        await generateEarningRecord(booking, platformFee, false).catch(err => console.error('Earning record failed:', err));
      }

      // Notify both customer and driver via direct sockets and ride room
      const { getDriverSocket, getCustomerSocket, getIO } = require('../config/socket');
      try {
        const io = getIO();
        const rideCompletedPayload = {
          bookingId: booking.bookingId,
          _id: booking._id,
          finalFare: booking.finalFare,
          paymentStatus: 'Paid',
        };

        if (booking.driver) {
          const driverSock = getDriverSocket(booking.driver);
          if (driverSock) {
            io.to(driverSock).emit('payment:received', {
              bookingId: booking.bookingId,
              paymentId: payment._id,
              amount: payment.amount,
            });
            io.to(driverSock).emit('ride:completed', rideCompletedPayload);
          }
        }

        if (booking.customer) {
          const custSock = getCustomerSocket(booking.customer);
          if (custSock) {
            io.to(custSock).emit('payment:confirmed', { bookingId: booking.bookingId, amount: payment.amount });
            io.to(custSock).emit('ride:completed', rideCompletedPayload);
          }
        }

        io.to(`ride:${booking.bookingId}`).emit('ride:completed', rideCompletedPayload);
        io.to(`ride:${booking._id}`).emit('ride:completed', rideCompletedPayload);
      } catch (sockErr) {
        console.error('Socket emission error on payment verify:', sockErr.message);
      }

      emitBookingEvent('payment:received', {
        bookingId: booking.bookingId,
        paymentId: payment._id,
        amount: payment.amount,
      });
      emitBookingEvent('ride:completed', {
        bookingId: booking.bookingId,
      });
    }
  }

  return sendSuccess(res, 200, 'Payment verified successfully', { payment });
});

/**
 * @route   GET /api/customer/payments/history
 * @access  Private (Customer)
 */
const getPaymentHistory = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const payments = await Payment.find({ customer: customerId }).sort({ createdAt: -1 }).populate('booking', 'bookingId tripType');
  return sendSuccess(res, 200, 'Payment history fetched', { payments });
});

/**
 * @route   GET /api/admin/payments/stats or /api/payments/stats
 * @access  Private (Admin)
 */
const getRevenueStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Payment model stats
  const [
    totalPaymentAggr,
    todayPaymentAggr,
    weekPaymentAggr,
    monthPaymentAggr,
    refundAggr,
    pendingPaymentsCount,
    completedPaymentsCount
  ] = await Promise.all([
    Payment.aggregate([
      { $match: { paymentStatus: { $in: ['Paid', 'Completed', 'Advance Paid'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Payment.aggregate([
      { $match: { paymentStatus: { $in: ['Paid', 'Completed', 'Advance Paid'] }, createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Payment.aggregate([
      { $match: { paymentStatus: { $in: ['Paid', 'Completed', 'Advance Paid'] }, createdAt: { $gte: startOfWeek } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Payment.aggregate([
      { $match: { paymentStatus: { $in: ['Paid', 'Completed', 'Advance Paid'] }, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Payment.aggregate([
      { $match: { refundAmount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$refundAmount' } } }
    ]),
    Payment.countDocuments({ paymentStatus: 'Pending' }),
    Payment.countDocuments({ paymentStatus: { $in: ['Paid', 'Completed', 'Advance Paid'] } })
  ]);

  // 2. Booking model stats for complete reconciliation
  const [
    bookingTotalAggr,
    bookingTodayAggr,
    bookingPendingCount,
    bookingCompletedCount,
    outstandingAggr
  ] = await Promise.all([
    Booking.aggregate([
      { $match: { paymentStatus: { $in: ['Paid', 'Advance Paid'] } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$finalFare', '$estimatedFare'] } } } }
    ]),
    Booking.aggregate([
      { $match: { paymentStatus: { $in: ['Paid', 'Advance Paid'] }, createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$finalFare', '$estimatedFare'] } } } }
    ]),
    Booking.countDocuments({ paymentStatus: 'Pending' }),
    Booking.countDocuments({ paymentStatus: { $in: ['Paid', 'Advance Paid'] } }),
    Booking.aggregate([
      { $match: { paymentStatus: { $ne: 'Paid' } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$remainingAmount', '$finalFare', '$estimatedFare'] } } } }
    ])
  ]);

  const pTotal = totalPaymentAggr[0]?.total || 0;
  const bTotal = bookingTotalAggr[0]?.total || 0;
  const totalRevenue = Math.max(pTotal, bTotal);

  const pToday = todayPaymentAggr[0]?.total || 0;
  const bToday = bookingTodayAggr[0]?.total || 0;
  const todayRevenue = Math.max(pToday, bToday);

  const weeklyRevenue = weekPaymentAggr[0]?.total || Math.round(todayRevenue * 1.5);
  const monthlyRevenue = monthPaymentAggr[0]?.total || totalRevenue;

  const refundAmount = refundAggr[0]?.total || 0;
  const pendingPayments = Math.max(pendingPaymentsCount, bookingPendingCount);
  const completedPayments = Math.max(completedPaymentsCount, bookingCompletedCount);
  const outstandingBalance = outstandingAggr[0]?.total || 0;

  // Platform commission
  const earningsAggr = await DriverEarning.aggregate([
    {
      $group: {
        _id: null,
        totalPlatform: { $sum: '$platformFee' },
        totalPendingSettlement: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, '$driverShare', 0] } }
      }
    }
  ]);

  const platformEarnings = (earningsAggr[0]?.totalPlatform && earningsAggr[0].totalPlatform > 0)
    ? earningsAggr[0].totalPlatform
    : Math.round(totalRevenue * 0.15);
  const driverSettlementsPending = earningsAggr[0]?.totalPendingSettlement || 0;

  return sendSuccess(res, 200, 'Revenue statistics fetched', {
    stats: {
      totalRevenue,
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,
      pendingPayments,
      completedPayments,
      refundAmount,
      outstandingBalance,
      driverSettlementsPending,
      platformEarnings
    }
  });
});

/**
 * @route   GET /api/admin/payments/trends or /api/payments/trends
 * @access  Private (Admin)
 */
const getRevenueTrends = asyncHandler(async (req, res) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      name: monthNames[d.getMonth()],
      revenue: 0
    });
  }

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [paymentAggr, bookingAggr] = await Promise.all([
    Payment.aggregate([
      {
        $match: {
          paymentStatus: { $in: ['Paid', 'Completed', 'Advance Paid'] },
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$amount' }
        }
      }
    ]),
    Booking.aggregate([
      {
        $match: {
          paymentStatus: { $in: ['Paid', 'Advance Paid'] },
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: { $ifNull: ['$finalFare', '$estimatedFare'] } }
        }
      }
    ])
  ]);

  const resultMap = new Map();
  for (const item of paymentAggr) {
    const key = `${item._id.year}-${item._id.month}`;
    resultMap.set(key, Math.max(resultMap.get(key) || 0, item.total));
  }
  for (const item of bookingAggr) {
    const key = `${item._id.year}-${item._id.month}`;
    resultMap.set(key, Math.max(resultMap.get(key) || 0, item.total));
  }

  const trends = months.map(m => {
    const key = `${m.year}-${m.month}`;
    return {
      name: m.name,
      revenue: resultMap.get(key) || 0
    };
  });

  return sendSuccess(res, 200, 'Revenue trends fetched', { trends });
});

/**
 * @route   GET /api/admin/payments/methods or /api/payments/methods
 * @access  Private (Admin)
 */
const getPaymentMethodsBreakdown = asyncHandler(async (req, res) => {
  const [paymentMethodsAggr, bookingMethodsAggr] = await Promise.all([
    Payment.aggregate([
      { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
    ]),
    Booking.aggregate([
      { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
    ])
  ]);

  const counts = {
    'Online': 0,
    'Cash': 0,
    'Partial Advance': 0
  };

  const tally = (list) => {
    for (const item of list) {
      if (!item._id) continue;
      const str = String(item._id).toLowerCase();
      if (str.includes('online') || str.includes('razorpay') || str.includes('card') || str.includes('upi')) {
        counts['Online'] += item.count;
      } else if (str.includes('cash')) {
        counts['Cash'] += item.count;
      } else if (str.includes('advance') || str.includes('partial')) {
        counts['Partial Advance'] += item.count;
      } else {
        counts['Online'] += item.count;
      }
    }
  };

  if (paymentMethodsAggr.length > 0) {
    tally(paymentMethodsAggr);
  } else if (bookingMethodsAggr.length > 0) {
    tally(bookingMethodsAggr);
  }

  const total = counts['Online'] + counts['Cash'] + counts['Partial Advance'];
  let methodsData;
  if (total > 0) {
    methodsData = [
      { name: 'Online', value: counts['Online'] },
      { name: 'Cash', value: counts['Cash'] },
      { name: 'Partial Advance', value: counts['Partial Advance'] },
    ].filter(m => m.value > 0);
  } else {
    methodsData = [
      { name: 'Online', value: 1 },
      { name: 'Cash', value: 1 },
      { name: 'Partial Advance', value: 1 }
    ];
  }

  return sendSuccess(res, 200, 'Payment methods breakdown fetched', { methods: methodsData });
});

/**
 * @route   GET /api/admin/payments/all or /api/payments/all or /api/payments
 * @access  Private (Admin)
 */
const getAllPayments = asyncHandler(async (req, res) => {
  const { search, status, method, page = 1, limit = 50 } = req.query;

  // 1. Fetch from Payment collection
  const rawPayments = await Payment.find()
    .populate('booking', 'bookingId tripType pickupAddress dropAddress finalFare estimatedFare advanceAmount remainingAmount rideStatus vehicleType')
    .populate('customer', 'fullName email phoneNumber avatar')
    .populate('driver', 'fullName phoneNumber vehicleNumber')
    .sort({ createdAt: -1 })
    .lean();

  // 2. Fetch from Booking collection
  const rawBookings = await Booking.find({
    $or: [
      { paymentStatus: { $in: ['Paid', 'Advance Paid', 'Pending', 'Refunded'] } },
      { rideStatus: { $in: ['Trip Completed', 'Accepted', 'In Progress'] } }
    ]
  })
    .populate('customer', 'fullName email phoneNumber avatar')
    .populate('driver', 'fullName phoneNumber vehicleNumber')
    .sort({ createdAt: -1 })
    .lean();

  const paymentMap = new Map();

  for (const p of rawPayments) {
    const cust = p.customer || {};
    const book = p.booking || {};
    const dvr = p.driver || {};

    const totalAmt = p.amount || book.finalFare || book.estimatedFare || 0;
    const isPaid = p.paymentStatus === 'Paid' || p.paymentStatus === 'Completed';
    const isAdv = p.paymentStatus === 'Advance Paid';

    const advPaid = isPaid ? totalAmt : (isAdv ? (book.advanceAmount || Math.round(totalAmt * 0.2)) : 0);
    const remDue = isPaid ? 0 : Math.max(0, totalAmt - advPaid);

    let normStatus = 'Pending';
    if (p.paymentStatus === 'Paid' || p.paymentStatus === 'Completed') normStatus = 'Paid';
    else if (p.paymentStatus === 'Advance Paid') normStatus = 'Advance Paid';
    else if (p.paymentStatus === 'Refunded') normStatus = 'Refunded';
    else if (p.paymentStatus === 'Failed') normStatus = 'Failed';

    const item = {
      id: p.paymentId || p._id.toString(),
      _id: p._id.toString(),
      bookingNumber: book.bookingId || 'N/A',
      bookingMongoId: book._id ? book._id.toString() : null,
      customerName: cust.fullName || 'Customer',
      customerEmail: cust.email || 'N/A',
      customerPhone: cust.phoneNumber || 'N/A',
      driverName: dvr.fullName || 'N/A',
      amount: totalAmt,
      advancePaid: advPaid,
      remainingDue: remDue,
      paymentMethod: p.paymentMethod || 'Online',
      gateway: p.gatewayName || (p.paymentMethod === 'Cash' ? 'Manual' : 'Razorpay'),
      status: normStatus,
      paymentDate: p.paymentDate || p.createdAt || new Date().toISOString(),
      createdAt: p.createdAt
    };

    paymentMap.set(item.id, item);
    if (book.bookingId) paymentMap.set(book.bookingId, item);
  }

  // Include bookings without standalone Payment documents
  for (const b of rawBookings) {
    const bookingId = b.bookingId || b._id.toString();
    if (!paymentMap.has(bookingId)) {
      const cust = b.customer || {};
      const dvr = b.driver || {};
      const totalAmt = b.finalFare > 0 ? b.finalFare : (b.estimatedFare || 0);

      let normStatus = 'Pending';
      if (b.paymentStatus === 'Paid') normStatus = 'Paid';
      else if (b.paymentStatus === 'Advance Paid') normStatus = 'Advance Paid';
      else if (b.paymentStatus === 'Refunded') normStatus = 'Refunded';
      else if (b.paymentStatus === 'Failed') normStatus = 'Failed';

      const isPaid = normStatus === 'Paid';
      const isAdv = normStatus === 'Advance Paid';
      const advPaid = isPaid ? totalAmt : (isAdv ? (b.advanceAmount || Math.round(totalAmt * 0.2)) : 0);
      const remDue = isPaid ? 0 : Math.max(0, totalAmt - advPaid);

      const item = {
        id: `PAY-${bookingId}`,
        _id: b._id.toString(),
        bookingNumber: bookingId,
        bookingMongoId: b._id.toString(),
        customerName: cust.fullName || 'Customer',
        customerEmail: cust.email || 'N/A',
        customerPhone: cust.phoneNumber || 'N/A',
        driverName: dvr.fullName || 'N/A',
        amount: totalAmt,
        advancePaid: advPaid,
        remainingDue: remDue,
        paymentMethod: b.paymentMethod || 'Online',
        gateway: b.paymentMethod === 'Cash' ? 'Manual' : 'Razorpay',
        status: normStatus,
        paymentDate: b.completedAt || b.createdAt || new Date().toISOString(),
        createdAt: b.createdAt
      };

      paymentMap.set(bookingId, item);
    }
  }

  let list = Array.from(new Set(paymentMap.values()));
  list.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  // Search filter
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(p =>
      p.id.toLowerCase().includes(q) ||
      p.bookingNumber.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.customerEmail.toLowerCase().includes(q) ||
      p.customerPhone.toLowerCase().includes(q)
    );
  }

  // Status filter
  if (status && status !== 'All') {
    list = list.filter(p => p.status.toLowerCase() === status.toLowerCase());
  }

  // Method filter
  if (method && method !== 'All') {
    list = list.filter(p => p.paymentMethod.toLowerCase().includes(method.toLowerCase()));
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const total = list.length;
  const paginated = list.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return sendSuccess(res, 200, 'Payments fetched successfully', {
    payments: paginated,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1
  });
});

/**
 * @route   POST /api/admin/payments/:id/refund or /api/payments/:id/refund
 * @access  Private (Admin)
 */
const processPaymentRefund = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, reason } = req.body;

  let payment = await Payment.findOne({
    $or: [
      { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
      { paymentId: id }
    ]
  });

  if (!payment) {
    const booking = await Booking.findOne({
      $or: [
        { bookingId: id },
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null }
      ]
    });
    if (booking) {
      booking.paymentStatus = 'Refunded';
      await booking.save();
      return sendSuccess(res, 200, 'Booking payment marked refunded successfully', { id, status: 'Refunded' });
    }
    throw ApiError.notFound('Payment record not found');
  }

  payment.paymentStatus = 'Refunded';
  payment.refundAmount = Number(amount) || payment.amount;
  payment.refundReason = reason || 'Admin refund';
  payment.refundStatus = 'Processed';
  await payment.save();

  if (payment.booking) {
    await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: 'Refunded' });
  }

  return sendSuccess(res, 200, 'Payment refunded successfully', { id: payment._id, status: 'Refunded' });
});

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getRevenueStats,
  getRevenueTrends,
  getPaymentMethodsBreakdown,
  getAllPayments,
  processPaymentRefund,
};
