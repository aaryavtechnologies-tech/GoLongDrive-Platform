// src/controllers/customer.vehicle.controller.js
const VehicleType = require('../models/VehicleType.model.js');
const Setting = require('../models/Setting.model.js');
const { calculateDistance } = require('../utils/distance.util.js');

exports.searchVehicles = async (req, res) => {
  try {
    const { from, to, date, time } = req.query;

    if (!from || !to) {
      return res.status(400).json({ success: false, message: 'From and To locations are required' });
    }

    // 1. Calculate Distance
    const distanceData = await calculateDistance(from, to);
    const distanceKm = distanceData.distanceValueKm;

    // 2. Fetch admin pricing settings
    const settings = await Setting.findOne();
    const pricingCfg = settings?.pricingSettings || {};
    const configuredBasePrice = typeof pricingCfg.basePrice === 'number' ? pricingCfg.basePrice : 2000;
    const configuredPricePerKm = typeof pricingCfg.pricePerKm === 'number' ? pricingCfg.pricePerKm : 12;
    const shortRideThresholdKm = typeof pricingCfg.shortRideThresholdKm === 'number' ? pricingCfg.shortRideThresholdKm : 60;

    // Determine if this is a long ride (base fare applies)
    const isLongRide = distanceKm >= shortRideThresholdKm;
    const baseFare = isLongRide ? configuredBasePrice : 0;

    // 3. Fetch all active vehicle types
    const vehicles = await VehicleType.find({ isActive: true });

    // 4. Fetch all online and available drivers to indicate real-time availability
    const Driver = require('../models/Driver.model');
    const { DRIVER_STATUS, ONLINE_STATUS, AVAILABILITY_STATUS } = require('../utils/constants');
    const { normaliseVehicleType } = require('../services/booking.service');

    const onlineDrivers = await Driver.find({
      driverStatus: DRIVER_STATUS.APPROVED,
      onlineStatus: ONLINE_STATUS.ONLINE,
      availabilityStatus: AVAILABILITY_STATUS.AVAILABLE,
    }).select('vehicle');

    const onlineCounts = {};
    onlineDrivers.forEach(d => {
      const vType = normaliseVehicleType(d.vehicle?.type);
      onlineCounts[vType] = (onlineCounts[vType] || 0) + 1;
    });

    // 5. Calculate fare and availability for each vehicle type
    const searchResults = vehicles.map(vehicle => {
      // Vehicle-specific pricePerKm overrides global setting if set
      const pricePerKm = (vehicle.pricePerKm) ? vehicle.pricePerKm : configuredPricePerKm;
      const distanceCharge = distanceKm * pricePerKm;
      const finalFare = Math.round(baseFare + distanceCharge);
      const vTypeNormalised = normaliseVehicleType(vehicle.name);
      const availableNow = (onlineCounts[vTypeNormalised] || 0) > 0;

      return {
        id: vehicle._id,
        name: vehicle.name,
        category: vehicle.category,
        seatingCapacity: vehicle.seatingCapacity,
        luggageCapacity: vehicle.luggageCapacity,
        iconUrl: vehicle.iconUrl,
        baseFare: baseFare,
        distanceCharge: Math.round(distanceCharge),
        pricePerKm: pricePerKm,
        fare: finalFare,
        advanceAmount: vehicle.advanceAmount,
        distanceText: distanceData.distanceText,
        distanceValueKm: distanceKm,
        durationText: distanceData.durationText,
        availableNow: availableNow,
        onlineCount: onlineCounts[vTypeNormalised] || 0,
        isLongRide: isLongRide,
        shortRideThresholdKm: shortRideThresholdKm,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        route: { from, to, date, time },
        distance: distanceData,
        vehicles: searchResults,
        pricingInfo: {
          isLongRide,
          shortRideThresholdKm,
          baseFare,
          distanceKm,
        }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

