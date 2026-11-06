// src/controllers/ticket.controller.js

const SupportTicket = require('../models/SupportTicket.model');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../utils/constants');

/**
 * Helper to generate ticket ID: TCK-YYYYMMDD-XXXX
 */
const generateTicketId = async () => {
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  const lastTicket = await SupportTicket.findOne({
    ticketId: new RegExp(`^TCK-${datePrefix}-`)
  }).sort({ createdAt: -1 });

  let nextSequence = 1;
  if (lastTicket && lastTicket.ticketId) {
    const parts = lastTicket.ticketId.split('-');
    if (parts.length === 3) {
      nextSequence = parseInt(parts[2], 10) + 1;
    }
  }

  return `TCK-${datePrefix}-${String(nextSequence).padStart(4, '0')}`;
};

/**
 * @route   POST /api/v1/tickets
 * @access  Private (Customer or Driver)
 */
const createTicket = asyncHandler(async (req, res) => {
  const user = req.user;
  const { subject, category, description, priority, bookingId } = req.body;

  if (!subject || !description) {
    throw ApiError.badRequest('Subject and description are required');
  }

  const isDriver = user.role === ROLES.DRIVER;
  const ticketId = await generateTicketId();

  const ticket = new SupportTicket({
    ticketId,
    creatorType: isDriver ? 'driver' : 'customer',
    driver: isDriver ? user._id : undefined,
    customer: !isDriver ? user._id : undefined,
    booking: bookingId || undefined,
    subject,
    category: category || 'Other',
    description,
    priority: priority || 'Medium',
    status: 'Open',
    messages: [
      {
        sender: isDriver ? 'driver' : 'customer',
        senderName: user.fullName || 'User',
        message: description,
        createdAt: new Date(),
      },
    ],
  });

  await ticket.save();

  return sendSuccess(res, 201, 'Support ticket created successfully', { ticket });
});

/**
 * @route   GET /api/v1/tickets/my-tickets
 * @access  Private (Customer or Driver)
 */
const getMyTickets = asyncHandler(async (req, res) => {
  const user = req.user;
  const isDriver = user.role === ROLES.DRIVER;

  const query = isDriver ? { driver: user._id } : { customer: user._id };
  const tickets = await SupportTicket.find(query).sort({ createdAt: -1 });

  return sendSuccess(res, 200, 'Tickets fetched', { tickets });
});

/**
 * @route   GET /api/v1/tickets/:id
 * @access  Private (Customer, Driver, or Admin)
 */
const getTicketById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isObjectId = /^[a-fA-F0-9]{24}$/.test(id);
  const query = isObjectId ? { _id: id } : { ticketId: id };

  const ticket = await SupportTicket.findOne(query)
    .populate('customer', 'fullName email phoneNumber profileImage')
    .populate('driver', 'fullName email phoneNumber profileImage vehicle')
    .populate('booking', 'bookingId pickupAddress dropAddress');

  if (!ticket) throw ApiError.notFound('Ticket not found');

  return sendSuccess(res, 200, 'Ticket details', { ticket });
});

/**
 * @route   POST /api/v1/tickets/:id/reply
 * @access  Private (Customer, Driver, or Admin)
 */
const replyToTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const user = req.user;

  if (!message || !message.trim()) {
    throw ApiError.badRequest('Message cannot be empty');
  }

  const isObjectId = /^[a-fA-F0-9]{24}$/.test(id);
  const query = isObjectId ? { _id: id } : { ticketId: id };

  const ticket = await SupportTicket.findOne(query);
  if (!ticket) throw ApiError.notFound('Ticket not found');

  let senderType = 'customer';
  if (user.role === ROLES.ADMIN) {
    senderType = 'admin';
  } else if (user.role === ROLES.DRIVER) {
    senderType = 'driver';
  }

  ticket.messages.push({
    sender: senderType,
    senderName: user.fullName || (senderType === 'admin' ? 'Support Team' : 'User'),
    message: message.trim(),
    createdAt: new Date(),
  });

  // If admin replies and ticket was open, mark In Progress
  if (senderType === 'admin' && ticket.status === 'Open') {
    ticket.status = 'In Progress';
  }

  await ticket.save();

  return sendSuccess(res, 200, 'Reply sent', { ticket });
});

/**
 * @route   GET /api/v1/tickets/admin/all
 * @access  Private (Admin)
 */
const getAdminTickets = asyncHandler(async (req, res) => {
  const { status, creatorType, category, search, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status && status !== 'All') query.status = status;
  if (creatorType && creatorType !== 'All') query.creatorType = creatorType;
  if (category && category !== 'All') query.category = category;

  if (search) {
    query.$or = [
      { ticketId: new RegExp(search, 'i') },
      { subject: new RegExp(search, 'i') },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [tickets, total] = await Promise.all([
    SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('customer', 'fullName email phoneNumber profileImage')
      .populate('driver', 'fullName email phoneNumber profileImage vehicle'),
    SupportTicket.countDocuments(query),
  ]);

  return sendSuccess(res, 200, 'Admin tickets list', {
    tickets,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

/**
 * @route   PATCH /api/v1/tickets/admin/:id/status
 * @access  Private (Admin)
 */
const updateTicketStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const isObjectId = /^[a-fA-F0-9]{24}$/.test(id);
  const query = isObjectId ? { _id: id } : { ticketId: id };

  const ticket = await SupportTicket.findOne(query);
  if (!ticket) throw ApiError.notFound('Ticket not found');

  ticket.status = status;
  if (adminNotes) ticket.adminNotes = adminNotes;
  if (status === 'Resolved' || status === 'Closed') {
    ticket.resolvedAt = new Date();
    ticket.resolvedBy = req.user._id;
  }

  await ticket.save();

  return sendSuccess(res, 200, `Ticket status updated to ${status}`, { ticket });
});

module.exports = {
  createTicket,
  getMyTickets,
  getTicketById,
  replyToTicket,
  getAdminTickets,
  updateTicketStatus,
};

