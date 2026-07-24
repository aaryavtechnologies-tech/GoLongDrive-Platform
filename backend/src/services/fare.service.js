// src/services/fare.service.js

/**
 * Modular fare calculation service.
 * In a real-world app, these base values might be fetched from a database.
 */

const BASE_RATES = {
  'Sedan': { baseFare: 500, pricePerKm: 12 },
  'SUV': { baseFare: 800, pricePerKm: 15 },
  'Innova': { baseFare: 1000, pricePerKm: 18 },
  // Default fallback
  'Default': { baseFare: 500, pricePerKm: 15 }
};

const DRIVER_ALLOWANCE_PER_DAY = 300;
const NIGHT_CHARGE = 250;
const GST_RATE = 0.05; // 5%

/**
 * Calculate the estimated fare based on input parameters.
 * @param {Object} params
 * @param {string} params.vehicleType
 * @param {number} params.estimatedDistance - in KM
 * @param {number} params.days - Duration of the trip in days
 * @param {boolean} params.includesNightDrive
 * @returns {Object} Detailed fare breakdown
 */
const calculateEstimatedFare = ({ vehicleType, estimatedDistance = 0, days = 1, includesNightDrive = false }) => {
  const rates = BASE_RATES[vehicleType] || BASE_RATES['Default'];
  
  const baseFare = rates.baseFare;
  const distanceCharge = estimatedDistance * rates.pricePerKm;
  const driverAllowance = DRIVER_ALLOWANCE_PER_DAY * days;
  const nightChargeTotal = includesNightDrive ? NIGHT_CHARGE : 0;
  
  // These could be dynamic or entered manually later
  const tollCharges = 0;
  const stateTax = 0;
  const parkingCharges = 0;
  const extraCharges = 0;
  const couponDiscount = 0;

  const subTotal = baseFare + distanceCharge + driverAllowance + nightChargeTotal + tollCharges + stateTax + parkingCharges + extraCharges;
  const discountedTotal = Math.max(0, subTotal - couponDiscount);
  
  const gst = discountedTotal * GST_RATE;
  const grandTotal = Math.round(discountedTotal + gst);

  return {
    baseFare,
    distanceCharge,
    driverAllowance,
    nightChargeTotal,
    tollCharges,
    stateTax,
    parkingCharges,
    extraCharges,
    couponDiscount,
    subTotal,
    gst,
    grandTotal,
  };
};

module.exports = {
  calculateEstimatedFare,
};
