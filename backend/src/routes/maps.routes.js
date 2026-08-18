// src/routes/maps.routes.js
const router = require('express').Router();
const mapsService = require('../services/maps.service');
const { sendSuccess } = require('../helpers/response.helper');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/v1/maps/autocomplete
 */
router.get('/autocomplete', asyncHandler(async (req, res) => {
  const { input } = req.query;
  if (!input) throw ApiError.badRequest('Input query parameter is required');
  const suggestions = await mapsService.autocomplete(input);
  return sendSuccess(res, 200, 'Suggestions retrieved', { suggestions });
}));

/**
 * GET /api/v1/maps/details
 */
router.get('/details', asyncHandler(async (req, res) => {
  const { placeId } = req.query;
  if (!placeId) throw ApiError.badRequest('placeId query parameter is required');
  const details = await mapsService.placeDetails(placeId);
  return sendSuccess(res, 200, 'Place details retrieved', details);
}));

/**
 * GET /api/v1/maps/geocode
 */
router.get('/geocode', asyncHandler(async (req, res) => {
  const { address } = req.query;
  if (!address) throw ApiError.badRequest('Address query parameter is required');
  const coordinates = await mapsService.geocode(address);
  return sendSuccess(res, 200, 'Coordinates geocoded', coordinates);
}));

/**
 * GET /api/v1/maps/reverse-geocode
 */
router.get('/reverse-geocode', asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) throw ApiError.badRequest('lat and lng query parameters are required');
  const address = await mapsService.reverseGeocode(parseFloat(lat), parseFloat(lng));
  return sendSuccess(res, 200, 'Address reverse geocoded', { address });
}));

/**
 * POST /api/v1/maps/route
 */
router.post('/route', asyncHandler(async (req, res) => {
  const { originLat, originLng, destinationLat, destinationLng } = req.body;
  if (originLat === undefined || originLng === undefined || destinationLat === undefined || destinationLng === undefined) {
    throw ApiError.badRequest('originLat, originLng, destinationLat, and destinationLng are required in request body');
  }
  const route = await mapsService.getRoute(
    parseFloat(originLat),
    parseFloat(originLng),
    parseFloat(destinationLat),
    parseFloat(destinationLng)
  );
  return sendSuccess(res, 200, 'Route computed', route);
}));

/**
 * POST /api/v1/maps/distance
 */
router.post('/distance', asyncHandler(async (req, res) => {
  const { originLat, originLng, destinationLat, destinationLng } = req.body;
  if (originLat === undefined || originLng === undefined || destinationLat === undefined || destinationLng === undefined) {
    throw ApiError.badRequest('originLat, originLng, destinationLat, and destinationLng are required in request body');
  }
  const route = await mapsService.getRoute(
    parseFloat(originLat),
    parseFloat(originLng),
    parseFloat(destinationLat),
    parseFloat(destinationLng)
  );
  return sendSuccess(res, 200, 'Distance computed', {
    distanceText: route.distanceText,
    distanceValueKm: route.distanceValueKm,
    durationText: route.durationText,
    durationValueSec: route.durationValueSec
  });
}));

module.exports = router;
