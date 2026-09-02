// src/controllers/customer.vehicle.controller.js
const VehicleType = require('../models/VehicleType.model.js');
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

    // 2. Fetch all active vehicle types
    const vehicles = await VehicleType.find({ isActive: true });

    // 2.5 Fetch all online and available drivers to indicate real-time availability
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

    // 3. Calculate fare and availability for each vehicle type
    const searchResults = vehicles.map(vehicle => {
      let calculatedFare = distanceKm * vehicle.pricePerKm;
      
      // Enforce Base Fare
      if (calculatedFare < vehicle.baseFare) {
        calculatedFare = vehicle.baseFare;
      }

      const finalFare = Math.round(calculatedFare);
      const vTypeNormalised = normaliseVehicleType(vehicle.name);
      const availableNow = (onlineCounts[vTypeNormalised] || 0) > 0;

      return {
        id: vehicle._id,
        name: vehicle.name,
        category: vehicle.category,
        seatingCapacity: vehicle.seatingCapacity,
        luggageCapacity: vehicle.luggageCapacity,
        iconUrl: vehicle.iconUrl,
        fare: finalFare,
        advanceAmount: vehicle.advanceAmount,
        distanceText: distanceData.distanceText,
        distanceValueKm: distanceKm,
        durationText: distanceData.durationText,
        availableNow: availableNow,
        onlineCount: onlineCounts[vTypeNormalised] || 0
      };
    });

    res.status(200).json({
      success: true,
      data: {
        route: { from, to, date, time },
        distance: distanceData,
        vehicles: searchResults,
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
