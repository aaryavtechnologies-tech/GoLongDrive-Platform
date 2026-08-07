// src/routes/admin.driver.routes.js

const router = require('express').Router();
const { 
  getAllDrivers, 
  getDriverById, 
  createDriver, 
  updateDriverStatus,
  getDriverDocuments,
  getDriverRides,
  getDriverEarnings,
  getDriverStatistics,
  getDriverTimeline
} = require('../controllers/admin.driver.controller');
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

/**
 * @swagger
 * /api/admin/drivers/{id}/status:
 *   patch:
 *     summary: Update driver approval status
 *     tags: [Admin Drivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Driver status updated
 */
router.patch('/:id/status', isAdmin, updateDriverStatus);

/**
 * @swagger
 * /api/admin/drivers/{id}/documents:
 *   get:
 *     summary: Get driver documents
 *     tags: [Admin Drivers]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/documents', isAdmin, getDriverDocuments);

/**
 * @swagger
 * /api/admin/drivers/{id}/rides:
 *   get:
 *     summary: Get driver rides
 *     tags: [Admin Drivers]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/rides', isAdmin, getDriverRides);

/**
 * @swagger
 * /api/admin/drivers/{id}/earnings:
 *   get:
 *     summary: Get driver earnings
 *     tags: [Admin Drivers]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/earnings', isAdmin, getDriverEarnings);

/**
 * @swagger
 * /api/admin/drivers/{id}/statistics:
 *   get:
 *     summary: Get driver statistics
 *     tags: [Admin Drivers]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/statistics', isAdmin, getDriverStatistics);

/**
 * @swagger
 * /api/admin/drivers/{id}/timeline:
 *   get:
 *     summary: Get driver timeline
 *     tags: [Admin Drivers]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/timeline', isAdmin, getDriverTimeline);

module.exports = router;
