// src/services/fare.service.js

const Setting = require('../models/Setting.model');
const VehicleType = require('../models/VehicleType.model');

/**
 * Async fare calculator — reads pricing config from admin settings.
 *
 * Pricing Logic:
 *  - distanceKm < shortRideThresholdKm (default 60) → charge ONLY per-km price (no base fare)
 *  - distanceKm >= shortRideThresholdKm             → charge base price + per-km price
 *
 * @param {Object} params
 * @param {string} params.vehicleType
 * @param {number} params.distanceKm - Route distance in KM
 * @param {number} [params.days=1] - Trip duration in days
 * @returns {Promise<Object>} Detailed fare breakdown
 */
const calculateFareFromSettings = async ({ vehicleType, distanceKm = 0, days = 1 }) => {
  const settings = await Setting.findOne();
  const pricingCfg = settings?.pricingSettings || {};
  const configuredBasePrice = typeof pricingCfg.basePrice === 'number' ? pricingCfg.basePrice : 2000;
  const configuredPricePerKm = typeof pricingCfg.pricePerKm === 'number' ? pricingCfg.pricePerKm : 12;
  const shortRideThresholdKm = typeof pricingCfg.shortRideThresholdKm === 'number' ? pricingCfg.shortRideThresholdKm : 60;

  // Vehicle-specific pricePerKm overrides global setting
  const vehicle = await VehicleType.findOne({ name: vehicleType });
  const pricePerKm = (vehicle && vehicle.pricePerKm) ? vehicle.pricePerKm : configuredPricePerKm;

  const isLongRide = distanceKm >= shortRideThresholdKm;
  const baseFare = isLongRide ? configuredBasePrice : 0;
  const distanceCharge = distanceKm * pricePerKm;
  const grandTotal = Math.round(baseFare + distanceCharge);

  return {
    baseFare,
    distanceCharge,
    pricePerKm,
    grandTotal,
    isLongRide,
    shortRideThresholdKm,
  };
};

/**
 * Synchronous fare calculator (legacy / fallback — used by older code paths).
 * Uses hardcoded defaults. Prefer calculateFareFromSettings for new code.
 *
 * @param {Object} params
 * @param {string} params.vehicleType
 * @param {number} params.estimatedDistance - in KM
 * @param {number} params.days - Duration of the trip in days
 * @returns {Object} Detailed fare breakdown
 */
const BASE_RATES = {
  'Sedan': { baseFare: 2000, pricePerKm: 12 },
  'SUV': { baseFare: 2000, pricePerKm: 15 },
  'Innova': { baseFare: 2000, pricePerKm: 18 },
  'Default': { baseFare: 2000, pricePerKm: 15 }
};

const SHORT_RIDE_THRESHOLD_KM_DEFAULT = 60;

const calculateEstimatedFare = ({ vehicleType, estimatedDistance = 0, days = 1, includesNightDrive = false }) => {
  const rates = BASE_RATES[vehicleType] || BASE_RATES['Default'];
  
  const isLongRide = estimatedDistance >= SHORT_RIDE_THRESHOLD_KM_DEFAULT;
  const baseFare = isLongRide ? rates.baseFare : 0;
  const distanceCharge = estimatedDistance * rates.pricePerKm;
  
  const subTotal = baseFare + distanceCharge;
  const grandTotal = Math.round(subTotal);

  return {
    baseFare,
    distanceCharge,
    subTotal,
    gst: 0,
    grandTotal,
    isLongRide,
  };
};

module.exports = {
  calculateEstimatedFare,
  calculateFareFromSettings,
};

