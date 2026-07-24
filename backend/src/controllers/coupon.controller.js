// src/controllers/coupon.controller.js

const Coupon = require('../models/Coupon.model');
const { validateAndCalculateDiscount } = require('../services/coupon.service');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   POST /api/admin/coupons
 * @access  Private (Admin)
 */
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  return sendSuccess(res, 201, 'Coupon created', { coupon });
});

/**
 * @route   PUT /api/admin/coupons/:id
 * @access  Private (Admin)
 */
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) throw ApiError.notFound('Coupon not found');
  return sendSuccess(res, 200, 'Coupon updated', { coupon });
});

/**
 * @route   GET /api/admin/coupons
 * @access  Private (Admin)
 */
const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'Coupons fetched', { coupons });
});

/**
 * @route   DELETE /api/admin/coupons/:id
 * @access  Private (Admin)
 */
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw ApiError.notFound('Coupon not found');
  return sendSuccess(res, 200, 'Coupon deleted');
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
  deleteCoupon,
  applyCoupon,
  getAvailableCoupons
};
