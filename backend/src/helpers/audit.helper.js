// src/helpers/audit.helper.js

const AuditLog = require('../models/AuditLog.model');

/**
 * Helper to log admin actions asynchronously
 * @param {Object} data - Audit log payload
 * @param {string} data.adminId - Admin user ID
 * @param {string} data.action - e.g., 'Update Settings'
 * @param {string} data.module - e.g., 'Settings'
 * @param {Object} [data.oldValue] - Previous state
 * @param {Object} [data.newValue] - New state
 * @param {Object} req - Express request object for IP/Endpoint
 */
const logAdminAction = async (data, req) => {
  try {
    const log = new AuditLog({
      admin: data.adminId,
      action: data.action,
      module: data.module,
      oldValue: data.oldValue,
      newValue: data.newValue,
      ipAddress: req ? req.ip || req.connection.remoteAddress : null,
      endpoint: req ? req.originalUrl : null,
    });
    await log.save();
  } catch (error) {
    console.error('AuditLog Error:', error.message);
  }
};

module.exports = { logAdminAction };
