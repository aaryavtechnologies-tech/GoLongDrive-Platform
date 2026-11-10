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

  const mongoose = require('mongoose');
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
