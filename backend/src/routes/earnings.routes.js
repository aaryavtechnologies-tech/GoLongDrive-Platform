// src/routes/earnings.routes.js

/**
 * @swagger
 * tags:
 *   name: Earnings
 *   description: Driver and Admin Earnings Dashboard
 */

const router = require('express').Router();
const { getDriverEarningsDashboard, getAdminEarningsDashboard } = require('../controllers/earnings.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const isDriver = [authenticate, requireRole(ROLES.DRIVER)];
const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

/**
 * @swagger
 * /api/driver/earnings/driver/dashboard:
 *   get:
 *     summary: Get driver earnings dashboard stats
 *     tags: [Earnings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved
 */
// Driver
router.get('/driver/dashboard', isDriver, getDriverEarningsDashboard);

/**
 * @swagger
 * /api/admin/earnings/admin/dashboard:
 *   get:
 *     summary: Get admin earnings dashboard stats
 *     tags: [Earnings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved
 */
// Admin
router.get('/admin/dashboard', isAdmin, getAdminEarningsDashboard);

module.exports = router;
