// src/routes/admin.driver.routes.js

const router = require('express').Router();
const { getAllDrivers, getDriverById, createDriver } = require('../controllers/admin.driver.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

/**
 * @swagger
 * /api/admin/drivers:
 *   get:
 *     summary: Get all drivers
 *     tags: [Admin Drivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of drivers
 */
router.get('/', isAdmin, getAllDrivers);

/**
 * @swagger
 * /api/admin/drivers/{id}:
 *   get:
 *     summary: Get a specific driver
 *     tags: [Admin Drivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Driver details
 */
router.get('/:id', isAdmin, getDriverById);

/**
 * @swagger
 * /api/admin/drivers:
 *   post:
 *     summary: Create a driver manually
 *     tags: [Admin Drivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Driver created
 */
router.post('/', isAdmin, createDriver);

module.exports = router;
