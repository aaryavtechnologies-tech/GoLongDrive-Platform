// src/services/earning.service.js

const DriverEarning = require('../models/DriverEarning.model');
const { PAYMENT_STATUS } = require('../utils/constants');

/**
 * Generates an earning record for a completed trip.
 * As per Phase 5 requirements, the user pays 500 advance. This advance is the platform fee.
 * The driver collects the rest directly.
 */
const generateEarningRecord = async (booking, advanceAmount) => {
  const platformFee = advanceAmount || 500;
  const driverEarnings = booking.estimatedFare - platformFee;

  const earning = new DriverEarning({
    driver: booking.driver,
    booking: booking._id,
    fare: booking.estimatedFare,
    commission: 0,
    platformFee: platformFee,
    driverEarnings: driverEarnings > 0 ? driverEarnings : 0,
    paymentStatus: PAYMENT_STATUS.PAID, // Since driver collected it physically
  });

  await earning.save();
  return earning;
};

module.exports = {
  generateEarningRecord
};
