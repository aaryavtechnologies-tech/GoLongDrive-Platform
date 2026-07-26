const express = require('express');
const {
  getServerMetrics,
  getDatabaseStatus,
  getPm2Status,
  getServerLogs
} = require('../controllers/system.controller');
/**
 * @swagger
 * tags:
 *   name: System Monitoring
 *   description: VPS Server and PM2 Health Monitoring
 */

const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

// Apply authentication and admin authorization to all system routes
router.use(isAdmin);

/**
 * @swagger
 * /api/v1/system/metrics:
 *   get:
 *     summary: Get VPS OS and server metrics (CPU, Memory, Uptime)
 *     tags: [System Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 */
router.get('/metrics', getServerMetrics);

/**
 * @swagger
 * /api/v1/system/database:
 *   get:
 *     summary: Get MongoDB connection status
 *     tags: [System Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Database status retrieved successfully
 */
router.get('/database', getDatabaseStatus);

/**
 * @swagger
 * /api/v1/system/pm2:
 *   get:
 *     summary: Get PM2 process list and memory/cpu usage
 *     tags: [System Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PM2 status retrieved successfully
 */
router.get('/pm2', getPm2Status);

/**
 * @swagger
 * /api/v1/system/logs:
 *   get:
 *     summary: Get the last 100 lines of server error logs
 *     tags: [System Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Server logs retrieved successfully
 */
router.get('/logs', getServerLogs);

module.exports = router;
