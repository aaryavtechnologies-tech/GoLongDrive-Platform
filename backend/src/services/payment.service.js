// src/services/payment.service.js
// Adapter pattern for payment gateways

const Payment = require('../models/Payment.model');
const { generateBookingId } = require('./booking.service');
const { PAYMENT_STATUS } = require('../utils/constants');

/**
 * Creates a unique payment reference ID
 */
const generatePaymentId = () => {
  return `PAY-${new Date().getTime().toString()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

/**
 * Payment Gateway Provider interface mock
 * When integrating a real provider (like Razorpay), we create a provider module
 * that implements these methods, and load it here.
 */
const gatewayAdapter = {
  createOrder: async (amount, currency, receiptId) => {
    // Stub: Returns mock order data for frontend to process
    return {
      orderId: `order_${Math.floor(Math.random() * 1000000)}`,
      amount,
      currency,
      receipt: receiptId,
      status: 'created'
    };
  },
  verifyPayment: async (orderId, paymentId, signature) => {
    // Stub: Always returns true for MVP
    return true;
  },
  processRefund: async (paymentId, amount) => {
    // Stub: Returns mock refund success
    return {
      refundId: `rfnd_${Math.floor(Math.random() * 1000000)}`,
      status: 'processed',
      amount
    };
  }
};

/**
 * Initialize a payment transaction and get gateway order
 */
const createPaymentOrder = async ({ bookingId, customerId, advanceAmount, totalAmount, paymentMethod }) => {
  const paymentIdStr = generatePaymentId();
  const amountToPay = advanceAmount > 0 ? advanceAmount : totalAmount;
  
  // 1. Call gateway adapter
  const orderDetails = await gatewayAdapter.createOrder(amountToPay * 100, 'INR', paymentIdStr); // *100 for smallest currency unit usually

  // 2. Save payment record as Pending
  const payment = new Payment({
    paymentId: paymentIdStr,
    booking: bookingId,
    customer: customerId,
    amount: totalAmount,
    advanceAmount,
    remainingAmount: totalAmount - advanceAmount,
    paymentMethod,
    paymentStatus: PAYMENT_STATUS.PENDING,
    gatewayName: 'TEST', // Dynamic when adapter is real
    gatewayResponse: orderDetails,
  });

  await payment.save();
  return { payment, orderDetails };
};

/**
 * Verify payment received from frontend
 */
const verifyPaymentTransaction = async (paymentId, gatewayOrderId, gatewayPaymentId, gatewaySignature) => {
  const payment = await Payment.findOne({ paymentId });
  if (!payment) throw new Error('Payment record not found');
  if (payment.paymentStatus !== PAYMENT_STATUS.PENDING) throw new Error('Payment already processed');

  const isValid = await gatewayAdapter.verifyPayment(gatewayOrderId, gatewayPaymentId, gatewaySignature);
  if (!isValid) {
    payment.paymentStatus = PAYMENT_STATUS.FAILED;
    await payment.save();
    throw new Error('Payment signature verification failed');
  }

  payment.paymentStatus = payment.advanceAmount > 0 ? PAYMENT_STATUS.ADVANCE_PAID : PAYMENT_STATUS.PAID;
  payment.transactionId = gatewayPaymentId;
  payment.paymentDate = new Date();
  await payment.save();

  return payment;
};

module.exports = {
  createPaymentOrder,
  verifyPaymentTransaction,
  gatewayAdapter
};
