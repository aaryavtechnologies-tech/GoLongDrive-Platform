// src/utils/distance.util.js
const axios = require('axios');

/**
 * Calculate distance between two addresses using Google Maps Distance Matrix API.
 * Falls back to a mock distance if the API key is not configured.
 * 
 * @param {string} origin 
 * @param {string} destination 
 * @returns {Promise<{ distanceText: string, distanceValueKm: number, durationText: string, durationValueSec: number }>}
 */
exports.calculateDistance = async (origin, destination) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    console.warn('Google Maps API key not found. Using fallback mock distance.');
    // Mock response for development/testing
    // Assuming 250km and 4.5 hours duration
    return {
      distanceText: '250 km',
      distanceValueKm: 250,
      durationText: '4 hours 30 mins',
      durationValueSec: 16200
    };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json`;
    const response = await axios.get(url, {
      params: {
        origins: origin,
        destinations: destination,
        key: apiKey,
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${response.data.status}`);
    }

    const element = response.data.rows[0].elements[0];
    
    if (element.status !== 'OK') {
      throw new Error(`Route not found between locations: ${element.status}`);
    }

    // element.distance.value is in meters
    const distanceValueKm = element.distance.value / 1000;

    return {
      distanceText: element.distance.text,
      distanceValueKm: distanceValueKm,
      durationText: element.duration.text,
      durationValueSec: element.duration.value
    };
  } catch (error) {
    console.error('Error calculating distance:', error.message);
    throw new Error('Failed to calculate distance between the specified locations.');
  }
};
