// src/cron/index.js

const cron = require('node-cron');
const Coupon = require('../models/Coupon.model');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

const setupCronJobs = () => {
  // 1. Expire Coupons - Runs daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      const now = new Date();
      const result = await Coupon.updateMany(
        { validUntil: { $lt: now }, isActive: true },
        { $set: { isActive: false } }
      );
      if (result.modifiedCount > 0) {
        logger.info(`Cron: Expired ${result.modifiedCount} coupons.`);
      }
    } catch (error) {
      logger.error(`Cron (Expire Coupons) Error: ${error.message}`);
    }
  });

  // 2. Clean temporary/orphaned uploads - Runs every Sunday at 3 AM
  cron.schedule('0 3 * * 0', () => {
    try {
      const uploadsDir = path.join(__dirname, '../../uploads');
      // A more robust system would check the DB if the file is actually linked to a user.
      // For now, this is a placeholder showing the scheduler is active.
      logger.info('Cron: Running weekly upload directory cleanup check.');
    } catch (error) {
      logger.error(`Cron (Uploads Cleanup) Error: ${error.message}`);
    }
  });

  logger.info('✅  Cron jobs scheduled');
};

module.exports = { setupCronJobs };
