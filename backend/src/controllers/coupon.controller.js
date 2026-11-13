// src/controllers/coupon.controller.js

const Coupon = require('../models/Coupon.model');
const Booking = require('../models/Booking.model');
const { validateAndCalculateDiscount } = require('../services/coupon.service');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Format coupon model into unified JSON shape
 */
const formatCoupon = (coupon) => {
  const c = coupon.toObject ? coupon.toObject() : { ...coupon };
  const now = new Date();
  const isExpired = new Date(c.validUntil) < now;
  let status = 'Active';
  if (!c.isActive) status = 'Inactive';
  if (isExpired) status = 'Expired';

  return {
    ...c,
    id: c._id ? c._id.toString() : c.id,
    code: c.couponCode,
    maxDiscount: c.maximumDiscount,
    minBookingAmount: c.minimumBookingAmount,
    startDate: c.validFrom,
    expiryDate: c.validUntil,
    status,
  };
};

/**
 * @route   POST /api/coupons or /api/admin/coupons
 * @access  Private (Admin)
 */
const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    couponCode,
    title,
    description,
    discountType,
    discountValue,
    maxDiscount,
    maximumDiscount,
    minBookingAmount,
    minimumBookingAmount,
    startDate,
    validFrom,
    expiryDate,
    validUntil,
    usageLimit,
    usagePerCustomer,
    isActive,
    status
  } = req.body;

  const rawCode = (code || couponCode || '').trim().toUpperCase();
  if (!rawCode) throw ApiError.badRequest('Coupon code is required');
  if (!title) throw ApiError.badRequest('Coupon title is required');
  if (discountValue === undefined || discountValue === null || Number(discountValue) < 0) {
    throw ApiError.badRequest('Valid discount value is required');
  }

  const existing = await Coupon.findOne({ couponCode: rawCode });
  if (existing) {
    throw ApiError.badRequest(`Coupon code "${rawCode}" already exists`);
  }

  const vFrom = validFrom || startDate ? new Date(validFrom || startDate) : new Date();
  const vUntil = validUntil || expiryDate ? new Date(validUntil || expiryDate) : new Date(Date.now() + 30 * 24 * 3600 * 1000);

  const activeState = status !== undefined ? status === 'Active' : (isActive !== undefined ? Boolean(isActive) : true);

  const parsedMaxDisc = maxDiscount !== undefined
    ? (maxDiscount === '' || maxDiscount === null ? null : Number(maxDiscount))
    : (maximumDiscount !== undefined && maximumDiscount !== '' && maximumDiscount !== null ? Number(maximumDiscount) : null);

  const parsedMinAmount = minBookingAmount !== undefined
    ? Number(minBookingAmount || 0)
    : Number(minimumBookingAmount || 0);

  const coupon = await Coupon.create({
    couponCode: rawCode,
    title,
    description: description || '',
    discountType: discountType || 'Percentage',
    discountValue: Number(discountValue),
    maximumDiscount: parsedMaxDisc,
    minimumBookingAmount: parsedMinAmount,
    validFrom: vFrom,
    validUntil: vUntil,
    usageLimit: usageLimit !== undefined && usageLimit !== '' && usageLimit !== null ? Number(usageLimit) : null,
    usagePerCustomer: usagePerCustomer !== undefined && usagePerCustomer !== '' && usagePerCustomer !== null ? Number(usagePerCustomer) : 1,
    isActive: activeState,
    usageCount: 0,
    usages: []
  });

  return sendSuccess(res, 201, 'Coupon created successfully', { coupon: formatCoupon(coupon) });
});

/**
 * @route   PUT /api/coupons/:id or /api/admin/coupons/:id
 * @access  Private (Admin)
 */
const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await Coupon.findById(id);
  if (!coupon) throw ApiError.notFound('Coupon not found');

  const {
    code,
    couponCode,
    title,
    description,
    discountType,
    discountValue,
    maxDiscount,
    maximumDiscount,
    minBookingAmount,
    minimumBookingAmount,
    startDate,
    validFrom,
    expiryDate,
    validUntil,
    usageLimit,
    usagePerCustomer,
    isActive,
    status
  } = req.body;

  if (code || couponCode) {
    const rawCode = (code || couponCode).trim().toUpperCase();
    if (rawCode !== coupon.couponCode) {
      const existing = await Coupon.findOne({ couponCode: rawCode, _id: { $ne: id } });
      if (existing) throw ApiError.badRequest(`Coupon code "${rawCode}" already in use`);
      coupon.couponCode = rawCode;
    }
  }

  if (title !== undefined) coupon.title = title;
  if (description !== undefined) coupon.description = description;
  if (discountType !== undefined) coupon.discountType = discountType;
  if (discountValue !== undefined) coupon.discountValue = Number(discountValue);

  if (maxDiscount !== undefined || maximumDiscount !== undefined) {
    const val = maxDiscount !== undefined ? maxDiscount : maximumDiscount;
    coupon.maximumDiscount = (val === '' || val === null || val === undefined) ? null : Number(val);
  }

  if (minBookingAmount !== undefined || minimumBookingAmount !== undefined) {
    const val = minBookingAmount !== undefined ? minBookingAmount : minimumBookingAmount;
    coupon.minimumBookingAmount = Number(val || 0);
  }

  if (startDate || validFrom) {
    coupon.validFrom = new Date(startDate || validFrom);
  }
  if (expiryDate || validUntil) {
    coupon.validUntil = new Date(expiryDate || validUntil);
  }

  if (usageLimit !== undefined) {
    coupon.usageLimit = (usageLimit === '' || usageLimit === null) ? null : Number(usageLimit);
  }
  if (usagePerCustomer !== undefined) {
    coupon.usagePerCustomer = (usagePerCustomer === '' || usagePerCustomer === null) ? 1 : Number(usagePerCustomer);
  }

  if (status !== undefined) {
    coupon.isActive = status === 'Active';
  } else if (isActive !== undefined) {
    coupon.isActive = Boolean(isActive);
  }

  await coupon.save();
  return sendSuccess(res, 200, 'Coupon updated successfully', { coupon: formatCoupon(coupon) });
});

/**
 * @route   GET /api/coupons or /api/admin/coupons
 * @access  Private (Admin)
 */
const getAllCoupons = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 50 } = req.query;
  const filter = {};

  if (search && search.trim()) {
    filter.$or = [
      { couponCode: { $regex: search.trim(), $options: 'i' } },
      { title: { $regex: search.trim(), $options: 'i' } }
    ];
  }

  const now = new Date();
  if (status && status !== 'All') {
    if (status === 'Active') {
      filter.isActive = true;
      filter.validUntil = { $gte: now };
    } else if (status === 'Inactive') {
      filter.isActive = false;
    } else if (status === 'Expired') {
      filter.validUntil = { $lt: now };
    }
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await Coupon.countDocuments(filter);
  const coupons = await Coupon.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const formatted = coupons.map(formatCoupon);

  return sendSuccess(res, 200, 'Coupons fetched successfully', {
    coupons: formatted,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1
  });
});

/**
 * @route   GET /api/coupons/:id or /api/admin/coupons/:id
 * @access  Private (Admin)
 */
const getCouponById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await Coupon.findById(id);
  if (!coupon) throw ApiError.notFound('Coupon not found');

  // Find all bookings where this coupon code was used
  const bookings = await Booking.find({
    $or: [
      { coupon: coupon.couponCode },
      { coupon: coupon.couponCode.toUpperCase() },
      { 'pricing.coupon': coupon._id }
    ]
  })
    .populate('customer', 'fullName phoneNumber email')
    .sort({ createdAt: -1 })
    .lean();

  const usageMap = new Map();

  for (const b of bookings) {
    const cust = b.customer || {};
    const bookingFare = b.finalFare || b.estimatedFare || 0;

    let disc = 0;
    if (coupon.discountType === 'Flat') {
      disc = coupon.discountValue;
    } else {
      disc = (bookingFare * coupon.discountValue) / 100;
      if (coupon.maximumDiscount && disc > coupon.maximumDiscount) {
        disc = coupon.maximumDiscount;
      }
    }

    usageMap.set(b._id.toString(), {
      id: b._id.toString(),
      bookingId: b.bookingId || b._id.toString(),
      bookingMongoId: b._id.toString(),
      customerName: cust.fullName || 'Registered User',
      customerPhone: cust.phoneNumber || 'N/A',
      customerEmail: cust.email || 'N/A',
      bookingAmount: bookingFare,
      discountAmount: disc,
      bookingStatus: b.rideStatus || b.status || 'completed',
      usedAt: b.createdAt
    });
  }

  // Also include any usages tracked directly in coupon.usages
  if (coupon.usages && Array.isArray(coupon.usages)) {
    for (const u of coupon.usages) {
      const key = u.bookingId ? u.bookingId.toString() : (u._id ? u._id.toString() : Math.random().toString());
      if (!usageMap.has(key)) {
        usageMap.set(key, {
          id: key,
          bookingId: u.bookingCode || u.bookingId || 'N/A',
          customerName: u.customerName || 'Registered User',
          customerPhone: u.customerPhone || 'N/A',
          customerEmail: u.customerEmail || 'N/A',
          bookingAmount: u.bookingAmount || 0,
          discountAmount: u.discountAmount || 0,
          bookingStatus: 'completed',
          usedAt: u.usedAt || coupon.updatedAt
        });
      }
    }
  }

  const usagesList = Array.from(usageMap.values()).sort(
    (a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime()
  );

  const totalDiscountGiven = usagesList.reduce((acc, u) => acc + (u.discountAmount || 0), 0);
  const totalBookingVolume = usagesList.reduce((acc, u) => acc + (u.bookingAmount || 0), 0);
  const uniqueCustomerSet = new Set(usagesList.map(u => u.customerPhone || u.customerEmail || u.customerName));
  const effectiveUsageCount = Math.max(coupon.usageCount || 0, usagesList.length);

  return sendSuccess(res, 200, 'Coupon details fetched', {
    coupon: formatCoupon(coupon),
    usages: usagesList,
    stats: {
      usageCount: effectiveUsageCount,
      usageLimit: coupon.usageLimit,
      remainingUses: coupon.usageLimit ? Math.max(0, coupon.usageLimit - effectiveUsageCount) : null,
      totalDiscountGiven,
      totalBookingVolume,
      uniqueCustomersCount: uniqueCustomerSet.size
    }
  });
});

/**
 * @route   DELETE /api/coupons/:id or /api/admin/coupons/:id
 * @access  Private (Admin)
 */
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw ApiError.notFound('Coupon not found');
  return sendSuccess(res, 200, 'Coupon deleted successfully');
});

/**
 * @route   POST /api/customer/coupons/apply
 * @access  Private (Customer)
 */
const applyCoupon = asyncHandler(async (req, res) => {
  const { couponCode, fareAmount } = req.body;
  const customerId = req.user._id;

  const result = await validateAndCalculateDiscount(couponCode, fareAmount, customerId);
  return sendSuccess(res, 200, 'Coupon applied successfully', result);
});

/**
 * @route   GET /api/customer/coupons
 * @access  Private (Customer)
 */
const getAvailableCoupons = asyncHandler(async (req, res) => {
  const now = new Date();
  const coupons = await Coupon.find({
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  }).select('couponCode title description discountType discountValue maximumDiscount minimumBookingAmount');
  return sendSuccess(res, 200, 'Available coupons fetched', { coupons });
});

module.exports = {
  createCoupon,
  updateCoupon,
  getAllCoupons,
  getCouponById,
  deleteCoupon,
  applyCoupon,
  getAvailableCoupons
};
