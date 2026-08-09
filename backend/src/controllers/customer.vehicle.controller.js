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

    // 3. Calculate fare for each vehicle type
    const searchResults = vehicles.map(vehicle => {
      let calculatedFare = distanceKm * vehicle.pricePerKm;
      
      // Enforce Base Fare
      if (calculatedFare < vehicle.baseFare) {
        calculatedFare = vehicle.baseFare;
      }

      // Add a 5% GST/Taxes for realism if desired, but we'll stick to simple fare
      const finalFare = Math.round(calculatedFare);

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
