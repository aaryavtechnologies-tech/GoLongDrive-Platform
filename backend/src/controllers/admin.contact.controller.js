// src/controllers/admin.contact.controller.js

const Contact = require('../models/Contact.model');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendMail } = require('../services/email.service'); // Using generic for reply if exported

/**
 * @route   POST /api/contact
 * @access  Public
 */
const submitTicket = asyncHandler(async (req, res) => {
  const ticket = await Contact.create(req.body);
  return sendSuccess(res, 201, 'Message submitted successfully. We will get back to you shortly.', { ticket });
});

/**
 * @route   GET /api/admin/contact
 * @access  Private (Admin)
 */
const getAllTickets = asyncHandler(async (req, res) => {
  const tickets = await Contact.find().sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'Contact tickets fetched', { tickets });
});

/**
 * @route   POST /api/admin/contact/:id/reply
 * @access  Private (Admin)
 */
const replyTicket = asyncHandler(async (req, res) => {
  const { replyMessage } = req.body;
  const ticket = await Contact.findById(req.params.id);
  
  if (!ticket) throw ApiError.notFound('Ticket not found');
  if (ticket.status === 'Closed') throw ApiError.badRequest('Ticket is already closed');

  ticket.adminReply = replyMessage;
  ticket.repliedBy = req.user._id;
  ticket.repliedAt = new Date();
  ticket.status = 'Closed';
  await ticket.save();

  // Sending email reply could be triggered here via email.service.js
  
  return sendSuccess(res, 200, 'Reply sent and ticket closed', { ticket });
});

module.exports = {
  submitTicket,
  getAllTickets,
  replyTicket
};
