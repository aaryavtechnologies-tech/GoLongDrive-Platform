// src/routes/customer.vehicle.routes.js

const router = require('express').Router();
const { searchVehicles } = require('../controllers/customer.vehicle.controller');

/**
 * @swagger
 * /api/customer/vehicles/search:
 *   get:
 *     summary: Search for available vehicles and calculate fares
 *     tags: [Customer - Vehicles]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *       - in: query
 *         name: time
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of vehicles with calculated fares
 */
router.get('/search', searchVehicles);

module.exports = router;
