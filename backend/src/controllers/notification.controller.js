// src/controllers/notification.controller.js

const Notification = require('../models/Notification.model');
const { broadcastNotification } = require('../services/notification.service');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/v1/notifications
 * @access  Private (Customer, Driver, Admin)
 */
const getMyNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Pagination setup (Step 6 related)
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({ userId });

  return sendSuccess(res, 200, 'Notifications fetched', { 
    notifications, 
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } 
  });
});

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) throw ApiError.notFound('Notification not found');
  return sendSuccess(res, 200, 'Notification marked as read', { notification });
});

/**
 * @route   DELETE /api/v1/notifications/:id
 * @access  Private
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!notification) throw ApiError.notFound('Notification not found');
  return sendSuccess(res, 200, 'Notification deleted');
});

/**
 * @route   POST /api/v1/admin/notifications/broadcast
 * @access  Private (Admin)
 */
const adminBroadcast = asyncHandler(async (req, res) => {
  const { userType, title, message } = req.body;
  if (!['Customer', 'Driver', 'Admin'].includes(userType)) {
    throw ApiError.badRequest('Invalid userType for broadcast');
  }

  await broadcastNotification(userType, title, message);
  return sendSuccess(res, 200, 'Broadcast sent successfully');
});

module.exports = {
  getMyNotifications,
  markAsRead,
  deleteNotification,
  adminBroadcast
};
