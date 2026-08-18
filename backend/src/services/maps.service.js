// src/services/maps.service.js
const axios = require('axios');

const BASE_URL = 'https://api.olamaps.io';

const getApiKey = () => {
  return process.env.OLA_MAPS_API_KEY || '';
};

/**
 * Check if the API key is configured or is placeholder
 */
const isConfigured = () => {
  const key = getApiKey();
  return key && key !== 'YOUR_OLA_MAPS_API_KEY';
};

/**
 * Autocomplete location suggestions
 * GET https://api.olamaps.io/places/v1/autocomplete
 */
const autocomplete = async (input) => {
  if (!isConfigured()) {
    console.warn('OLA Maps API key not configured. Using fallback mock autocomplete.');
    // Simulated suggestions
    const mockSuggestions = [
      { mainText: 'Ahmedabad', secondaryText: 'Gujarat, India', placeId: 'mock_ahmedabad' },
      { mainText: 'Mumbai', secondaryText: 'Maharashtra, India', placeId: 'mock_mumbai' },
      { mainText: 'Surat', secondaryText: 'Gujarat, India', placeId: 'mock_surat' },
      { mainText: 'Vadodara', secondaryText: 'Gujarat, India', placeId: 'mock_vadodara' },
      { mainText: 'Udaipur', secondaryText: 'Rajasthan, India', placeId: 'mock_udaipur' },
      { mainText: 'Pune', secondaryText: 'Maharashtra, India', placeId: 'mock_pune' },
      { mainText: 'Delhi', secondaryText: 'NCR, India', placeId: 'mock_delhi' },
      { mainText: 'Bengaluru', secondaryText: 'Karnataka, India', placeId: 'mock_bengaluru' }
    ];

    const filtered = mockSuggestions.filter(item => 
      item.mainText.toLowerCase().includes(input.toLowerCase()) || 
      item.secondaryText.toLowerCase().includes(input.toLowerCase())
    );
    return filtered.length > 0 ? filtered : mockSuggestions.slice(0, 3);
  }

  try {
    const response = await axios.get(`${BASE_URL}/places/v1/autocomplete`, {
      params: {
        input,
        api_key: getApiKey()
      },
      headers: {
        'X-Request-Id': `req-${Date.now()}`
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`OLA Maps autocomplete status: ${response.data.status}`);
    }

    const predictions = response.data.predictions || [];
    return predictions.map(p => {
      const structured = p.structured_formatting || {};
      return {
        placeId: p.place_id,
        mainText: structured.main_text || p.description,
        secondaryText: structured.secondary_text || ''
      };
    });
  } catch (error) {
    console.error('OLA Maps autocomplete failed, using mock:', error.message);
    return [
      { mainText: `${input} Station`, secondaryText: 'India', placeId: 'mock_station' },
      { mainText: `${input} Airport`, secondaryText: 'India', placeId: 'mock_airport' }
    ];
  }
};

/**
 * Forward geocoding / Place Details (getting lat/lng from placeId or address)
 * GET https://api.olamaps.io/places/v1/details
 */
const placeDetails = async (placeId) => {
  if (!isConfigured() || placeId.startsWith('mock_')) {
    // Return simulated coords
    const mockCoords = {
      'mock_ahmedabad': { lat: 23.0225, lng: 72.5714, address: 'Ahmedabad, Gujarat, India' },
      'mock_mumbai': { lat: 19.0760, lng: 72.8777, address: 'Mumbai, Maharashtra, India' },
      'mock_surat': { lat: 21.1702, lng: 72.8311, address: 'Surat, Gujarat, India' },
      'mock_vadodara': { lat: 22.3072, lng: 73.1812, address: 'Vadodara, Gujarat, India' },
      'mock_udaipur': { lat: 24.5854, lng: 73.7125, address: 'Udaipur, Rajasthan, India' },
      'mock_pune': { lat: 18.5204, lng: 73.8567, address: 'Pune, Maharashtra, India' },
      'mock_delhi': { lat: 28.7041, lng: 77.1025, address: 'Delhi, India' },
      'mock_bengaluru': { lat: 12.9716, lng: 77.5946, address: 'Bengaluru, Karnataka, India' }
    };
    return mockCoords[placeId] || { lat: 23.0225, lng: 72.5714, address: 'Simulated Address' };
  }

  try {
    const response = await axios.get(`${BASE_URL}/places/v1/details`, {
      params: {
        place_id: placeId,
        api_key: getApiKey()
      },
      headers: {
        'X-Request-Id': `req-${Date.now()}`
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`OLA Maps details status: ${response.data.status}`);
    }

    const result = response.data.result || {};
    const location = result.geometry?.location || {};
    return {
      lat: location.lat,
      lng: location.lng,
      address: result.formatted_address || result.name || ''
    };
  } catch (error) {
    console.error('OLA Maps details failed, using mock:', error.message);
    return { lat: 23.0225, lng: 72.5714, address: 'Fallback geocoded place' };
  }
};

/**
 * Address Geocoding
 * GET https://api.olamaps.io/places/v1/geocode
 */
const geocode = async (address) => {
  if (!isConfigured()) {
    return { lat: 23.0225, lng: 72.5714, address };
  }

  try {
    const response = await axios.get(`${BASE_URL}/places/v1/geocode`, {
      params: {
        address,
        api_key: getApiKey()
      },
      headers: {
        'X-Request-Id': `req-${Date.now()}`
      }
    });

    const result = response.data.geocodingResults?.[0] || {};
    const location = result.geometry?.location || {};
    return {
      lat: location.lat,
      lng: location.lng,
      address: result.formatted_address || address
    };
  } catch (error) {
    console.error('OLA Maps geocode failed:', error.message);
    return { lat: 23.0225, lng: 72.5714, address };
  }
};

/**
 * Reverse Geocoding
 * GET https://api.olamaps.io/places/v1/reverse-geocode
 */
const reverseGeocode = async (lat, lng) => {
  if (!isConfigured()) {
    return `Simulated Address (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }

  try {
    const response = await axios.get(`${BASE_URL}/places/v1/reverse-geocode`, {
      params: {
        latlng: `${lat},${lng}`,
        api_key: getApiKey()
      },
      headers: {
        'X-Request-Id': `req-${Date.now()}`
      }
    });

    const result = response.data.results?.[0] || {};
    return result.formatted_address || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error('OLA Maps reverse geocode failed:', error.message);
    return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

/**
 * Calculate route distance, duration and polyline
 * POST https://api.olamaps.io/routing/v1/directions
 */
const getRoute = async (originLat, originLng, destLat, destLng) => {
  if (!isConfigured()) {
    console.warn('OLA Maps API key not configured. Using fallback mock directions.');
    // Ahmedabad to Mumbai is approx 520 km, 8 hours
    const distanceMeters = 520000;
    const durationSeconds = 28800;
    const dummyPoints = 'a~|gFnqxpH~_@yf@'; 

    return {
      distanceText: '520 km',
      distanceValueKm: 520,
      durationText: '8 hours',
      durationValueSec: durationSeconds,
      polyline: dummyPoints
    };
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/routing/v1/directions?origin=${originLat},${originLng}&destination=${destLat},${destLng}&api_key=${getApiKey()}`,
      {},
      {
        headers: {
          'X-Request-Id': `req-${Date.now()}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status !== 'SUCCESS' && response.data.status !== 'OK') {
      throw new Error(`OLA Maps directions status: ${response.data.status}`);
    }

    const route = response.data.routes?.[0] || {};
    const leg = route.legs?.[0] || {};

    const distanceMeters = leg.distance || leg.distance?.value || 0;
    const durationSeconds = leg.duration || leg.duration?.value || 0;
    const polyline = route.overview_polyline || '';

    const distanceValueKm = Math.round(distanceMeters / 1000);
    const durationHours = Math.floor(durationSeconds / 3600);
    const durationMins = Math.round((durationSeconds % 3600) / 60);

    let durationText = `${durationMins} mins`;
    if (durationHours > 0) {
      durationText = `${durationHours} hours ${durationMins} mins`;
    }

    return {
      distanceText: `${distanceValueKm} km`,
      distanceValueKm,
      durationText,
      durationValueSec: durationSeconds,
      polyline
    };
  } catch (error) {
    console.error('OLA Maps routing failed, using mock:', error.message);
    return {
      distanceText: '100 km',
      distanceValueKm: 100,
      durationText: '2 hours',
      durationValueSec: 7200,
      polyline: 'a~|gFnqxpH~_@yf@'
    };
  }
};

module.exports = {
  autocomplete,
  placeDetails,
  geocode,
  reverseGeocode,
  getRoute
};
