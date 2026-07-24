// src/controllers/invoice.controller.js

const Invoice = require('../models/Invoice.model');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/customer/invoices
 * @access  Private (Customer)
 */
const getCustomerInvoices = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const invoices = await Invoice.find({ customer: customerId }).sort({ createdAt: -1 }).populate('booking', 'bookingId tripType');
  return sendSuccess(res, 200, 'Invoices fetched', { invoices });
});

/**
 * @route   GET /api/customer/invoices/:id
 * @access  Private (Customer)
 */
const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, customer: req.user._id });
  if (!invoice) throw ApiError.notFound('Invoice not found');
  return sendSuccess(res, 200, 'Invoice fetched', { invoice });
});

/**
 * @route   GET /api/admin/invoices
 * @access  Private (Admin)
 */
const getAllInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find().sort({ createdAt: -1 }).populate('booking', 'bookingId tripType').populate('customer', 'fullName');
  return sendSuccess(res, 200, 'Invoices fetched', { invoices });
});

module.exports = {
  getCustomerInvoices,
  getInvoiceById,
  getAllInvoices
};
