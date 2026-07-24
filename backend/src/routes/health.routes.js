// src/routes/health.routes.js

/**
 * @swagger
 * tags:
 *   name: System Health
 *   description: Monitoring and diagnostics
 */

const router = require('express').Router();
const { getSystemHealth, getDatabaseHealth, getServerHealth } = require('../controllers/health.controller');

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Basic health check
 *     tags: [System Health]
 *     responses:
 *       200:
 *         description: System is healthy
 */
router.get('/', getSystemHealth);

/**
 * @swagger
 * /api/v1/health/database:
 *   get:
 *     summary: Database health check
 *     tags: [System Health]
 *     responses:
 *       200:
 *         description: Database is healthy
 */
router.get('/database', getDatabaseHealth);

/**
 * @swagger
 * /api/v1/health/server:
 *   get:
 *     summary: Server resource metrics
 *     tags: [System Health]
 *     responses:
 *       200:
 *         description: Server metrics retrieved
 */
router.get('/server', getServerHealth);

module.exports = router;
