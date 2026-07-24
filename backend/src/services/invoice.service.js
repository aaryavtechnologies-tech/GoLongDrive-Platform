// src/services/invoice.service.js

const Invoice = require('../models/Invoice.model');
const Booking = require('../models/Booking.model');
const Payment = require('../models/Payment.model');
const { INVOICE_STATUS } = require('../utils/constants');

/**
 * Generates unique Invoice Number
 */
const generateInvoiceNumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const prefix = `INV-${dateStr}-`;

  // Find the latest invoice for today
  const lastInvoice = await Invoice.findOne({ invoiceNumber: new RegExp(`^${prefix}`) })
    .sort({ invoiceNumber: -1 })
    .collation({ locale: 'en_US', numericOrdering: true });

  let sequence = 1;
  if (lastInvoice) {
    const lastSeq = parseInt(lastInvoice.invoiceNumber.split('-')[2], 10);
    if (!isNaN(lastSeq)) {
      sequence = lastSeq + 1;
    }
  }

  const sequenceStr = sequence.toString().padStart(4, '0');
  return `${prefix}${sequenceStr}`;
};

/**
 * Generate invoice record in the database
 */
const generateInvoice = async (bookingId, paymentId) => {
  const booking = await Booking.findById(bookingId)
    .populate('customer', 'fullName email phoneNumber')
    .populate('driver', 'fullName phoneNumber vehicleType');
  
  if (!booking) throw new Error('Booking not found for invoice generation');

  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error('Payment not found for invoice generation');

  const invoiceNumber = await generateInvoiceNumber();

  const invoice = new Invoice({
    invoiceNumber,
    booking: booking._id,
    payment: payment._id,
    customer: booking.customer._id,
    driver: booking.driver ? booking.driver._id : null,
    customerDetails: {
      fullName: booking.customer.fullName,
      email: booking.customer.email,
      phoneNumber: booking.customer.phoneNumber,
    },
    driverDetails: booking.driver ? {
      fullName: booking.driver.fullName,
      phoneNumber: booking.driver.phoneNumber,
      vehicleType: booking.driver.vehicleType,
    } : null,
    bookingDetails: {
      pickupAddress: booking.pickupAddress,
      pickupCity: booking.pickupCity,
      dropAddress: booking.dropAddress,
      dropCity: booking.dropCity,
      tripDate: booking.pickupDate,
      vehicle: booking.vehicleType,
    },
    fareBreakdown: {
      baseFare: booking.estimatedFare, // Assuming estimated is base for MVP
      // other fields can be mapped from booking model if stored
    },
    discount: 0, // Should be fetched from coupon if applied
    taxes: 0,
    advancePaid: payment.advanceAmount,
    remainingPaid: payment.remainingAmount,
    totalPaid: payment.amount,
    paymentMethod: payment.paymentMethod,
    invoiceStatus: INVOICE_STATUS.GENERATED
  });

  await invoice.save();
  return invoice;
};

module.exports = {
  generateInvoice
};
