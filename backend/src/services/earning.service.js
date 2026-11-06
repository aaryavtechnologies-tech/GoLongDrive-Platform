// src/services/earning.service.js

const DriverEarning = require('../models/DriverEarning.model');
const Driver = require('../models/Driver.model');
const { PAYMENT_STATUS } = require('../utils/constants');

/**
 * Generates an earning record for a completed trip and updates driver's wallet.
 */
const generateEarningRecord = async (booking, advanceAmount, isCashCollected = false) => {
  const fare = (booking.finalFare && booking.finalFare > 0) ? booking.finalFare : booking.estimatedFare;
  const platformFee = advanceAmount || Math.round(fare * 0.1); // 10% platform fee fallback
  const netEarnings = Math.max(0, fare - platformFee);

  const earning = new DriverEarning({
    driver: booking.driver,
    booking: booking._id,
    fare: fare,
    commission: platformFee,
    platformFee: platformFee,
    driverEarnings: netEarnings,
    paymentStatus: PAYMENT_STATUS.PAID,
  });

  await earning.save();

  // If paid online, the platform holds the money, so we credit the driver's withdrawable wallet
  // If paid cash, the driver has collected the full fare in hand, so we deduct the platform fee from wallet
  if (!isCashCollected && booking.paymentMethod !== 'Cash') {
    await Driver.findByIdAndUpdate(booking.driver, {
      $inc: { walletBalance: netEarnings }
    });
  } else {
    // If cash, deduct platform fee (wallet can be adjusted)
    await Driver.findByIdAndUpdate(booking.driver, {
      $inc: { walletBalance: -platformFee }
    });
  }

  return earning;
};

module.exports = {
  generateEarningRecord
};
