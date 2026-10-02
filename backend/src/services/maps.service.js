// src/services/maps.service.js
const axios = require('axios');

const getApiKey = () => {
  return process.env.GOOGLE_MAPS_API_KEY || process.env.OLA_MAPS_API_KEY || '';
};

const isConfigured = () => {
  const key = getApiKey();
  return key && key !== 'YOUR_GOOGLE_MAPS_API_KEY' && key !== 'YOUR_OLA_MAPS_API_KEY';
};

const autocomplete = async (input) => {
  if (!isConfigured()) return [];
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
      params: { input, key: getApiKey(), components: 'country:in' }
    });
    
    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Maps autocomplete status: ${response.data.status}`);
    }

    return (response.data.predictions || []).map(p => ({
      placeId: p.place_id,
      mainText: p.structured_formatting?.main_text || p.description,
      secondaryText: p.structured_formatting?.secondary_text || ''
    }));
  } catch (error) {
    console.error('Google Maps autocomplete failed:', error.message);
    return [];
  }
};

const placeDetails = async (placeId) => {
  if (!isConfigured()) return { lat: 23.0225, lng: 72.5714, address: 'Fallback geocoded place' };
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
      params: { place_id: placeId, key: getApiKey() }
    });
    
    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps details status: ${response.data.status}`);
    }
    
    const location = response.data.result?.geometry?.location || {};
    return {
      lat: location.lat,
      lng: location.lng,
      address: response.data.result?.formatted_address || response.data.result?.name || ''
    };
  } catch (error) {
    console.error('Google Maps details failed:', error.message);
    return { lat: 23.0225, lng: 72.5714, address: 'Fallback geocoded place' };
  }
};

const geocode = async (address) => {
  if (!isConfigured()) return { lat: 23.0225, lng: 72.5714, address };
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: { address, key: getApiKey() }
    });
    
    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps geocode status: ${response.data.status}`);
    }
    
    const result = response.data.results?.[0] || {};
    const location = result.geometry?.location || {};
    return {
      lat: location.lat,
      lng: location.lng,
      address: result.formatted_address || address
    };
  } catch (error) {
    console.error('Google Maps geocode failed:', error.message);
    return { lat: 23.0225, lng: 72.5714, address };
  }
};

const reverseGeocode = async (lat, lng) => {
  if (!isConfigured()) return `Simulated Address (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: { latlng: `${lat},${lng}`, key: getApiKey() }
    });
    
    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps reverse geocode status: ${response.data.status}`);
    }
    
    const result = response.data.results?.[0] || {};
    return result.formatted_address || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error('Google Maps reverse geocode failed:', error.message);
    return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

const getRoute = async (originLat, originLng, destLat, destLng) => {
  if (!isConfigured()) {
    return {
      distanceText: '100 km',
      distanceValueKm: 100,
      durationText: '2 hours',
      durationValueSec: 7200,
      polyline: 'a~|gFnqxpH~_@yf@'
    };
  }
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
      params: {
        origin: `${originLat},${originLng}`,
        destination: `${destLat},${destLng}`,
        key: getApiKey()
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps directions status: ${response.data.status}`);
    }

    const route = response.data.routes?.[0] || {};
    const leg = route.legs?.[0] || {};

    const distanceMeters = leg.distance?.value || 0;
    const durationSeconds = leg.duration?.value || 0;
    const polyline = route.overview_polyline?.points || '';

    const distanceValueKm = Math.round(distanceMeters / 1000);
    const durationHours = Math.floor(durationSeconds / 3600);
    const durationMins = Math.round((durationSeconds % 3600) / 60);

    let durationText = `${durationMins} mins`;
    if (durationHours > 0) {
      durationText = `${durationHours} hours ${durationMins} mins`;
    }

    return {
      distanceText: leg.distance?.text || `${distanceValueKm} km`,
      distanceValueKm,
      durationText: leg.duration?.text || durationText,
      durationValueSec: durationSeconds,
      polyline
    };
  } catch (error) {
    console.error('Google Maps routing failed:', error.message);
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
