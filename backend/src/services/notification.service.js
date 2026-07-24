// src/services/notification.service.js

const Notification = require('../models/Notification.model');
const { getIO } = require('../config/socket');
const logger = require('../utils/logger');

/**
 * Send a notification to a specific user (saves to DB and emits via socket if online)
 */
const sendNotification = async ({ userId, userType, title, message, notificationType }) => {
  try {
    // 1. Save to Database
    const notification = await Notification.create({
      userId,
      userType,
      title,
      message,
      notificationType
    });

    // 2. Emit real-time event if socket is connected
    try {
      const io = getIO();
      // Assume clients join a room matching their userId when they connect
      io.to(userId.toString()).emit('new:notification', notification);
    } catch (socketError) {
      // Socket not initialized or error emitting, safe to ignore for DB persistence
      logger.warn(`Socket emission failed for notification: ${socketError.message}`);
    }

    return notification;
  } catch (error) {
    logger.error(`Failed to send notification to ${userId}: ${error.message}`);
    throw error;
  }
};

/**
 * Broadcast notification to a group of users
 */
const broadcastNotification = async (userType, title, message, notificationType = 'System Notification') => {
  try {
    // For MVP, we simply emit to a common room (e.g. "Customer", "Driver")
    // Database persistence for broadcast to thousands of users requires a different strategy 
    // (like a global notifications table or batch inserting). 
    // Here we will just emit via Socket for simplicity unless persistence per user is forced.
    
    const io = getIO();
    io.to(userType).emit('broadcast:notification', { title, message, notificationType, createdAt: new Date() });
    
    return true;
  } catch (error) {
    logger.error(`Broadcast failed: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sendNotification,
  broadcastNotification
};
