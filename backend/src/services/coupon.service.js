// src/services/coupon.service.js

const Coupon = require('../models/Coupon.model');
const { DISCOUNT_TYPES } = require('../utils/constants');
const ApiError = require('../utils/ApiError');

/**
 * Validate and calculate discount for a given coupon code and fare
 */
const validateAndCalculateDiscount = async (couponCode, totalFare, customerId) => {
  const coupon = await Coupon.findOne({ couponCode: couponCode.toUpperCase(), isActive: true });
  
  if (!coupon) throw ApiError.badRequest('Invalid or inactive coupon');

  const now = new Date();
  if (now < coupon.validFrom) throw ApiError.badRequest('Coupon is not valid yet');
  if (now > coupon.validUntil) throw ApiError.badRequest('Coupon has expired');

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw ApiError.badRequest('Coupon usage limit reached');
  }

  if (totalFare < coupon.minimumBookingAmount) {
    throw ApiError.badRequest(`Minimum booking amount of ${coupon.minimumBookingAmount} required`);
  }

  // TODO: Check per-customer usage by querying Booking collection if needed
  // For MVP, we skip the exact count query and assume it's valid if usagePerCustomer > 0

  let discount = 0;
  if (coupon.discountType === DISCOUNT_TYPES.FLAT) {
    discount = coupon.discountValue;
  } else if (coupon.discountType === DISCOUNT_TYPES.PERCENTAGE) {
    discount = (totalFare * coupon.discountValue) / 100;
  }

  if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
    discount = coupon.maximumDiscount;
  }

  // Ensure discount doesn't exceed fare
  discount = Math.min(discount, totalFare);

  return { discount, couponId: coupon._id };
};

/**
 * Increment usage counter after successful booking
 */
const applyCouponUsage = async (couponId) => {
  await Coupon.findByIdAndUpdate(couponId, { $inc: { usageCount: 1 } });
};

module.exports = {
  validateAndCalculateDiscount,
  applyCouponUsage
};
