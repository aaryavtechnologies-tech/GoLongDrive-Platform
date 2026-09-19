// src/controllers/payment.controller.js

const { createPaymentOrder, verifyPaymentTransaction } = require('../services/payment.service');
const { generateInvoice } = require('../services/invoice.service');
const { emitBookingEvent } = require('../services/booking.service');
const Booking = require('../models/Booking.model');
const Payment = require('../models/Payment.model');
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

  const booking = await Booking.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking not found');
  if (booking.customer.toString() !== customerId.toString()) {
    throw ApiError.forbidden('Access denied');
  }

  const { payment, orderDetails } = await createPaymentOrder({
    bookingId,
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
    if(booking) {
        emitBookingEvent('payment:received', { bookingId: booking.bookingId, paymentId: payment._id });
    }
  }

  return sendSuccess(res, 200, 'Payment verified successfully', { payment });
});

/**
 * @route   GET /api/customer/payments
 * @access  Private (Customer)
 */
const getPaymentHistory = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const payments = await Payment.find({ customer: customerId }).sort({ createdAt: -1 }).populate('booking', 'bookingId tripType');
  return sendSuccess(res, 200, 'Payment history fetched', { payments });
});

/**
 * @route   GET /api/admin/payments
 * @access  Private (Admin)
 */
const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 }).populate('booking', 'bookingId').populate('customer', 'fullName email');
  return sendSuccess(res, 200, 'All payments fetched', { payments });
});

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getAllPayments
};
