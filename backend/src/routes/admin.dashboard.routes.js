// src/routes/admin.dashboard.routes.js

/**
 * @swagger
 * tags:
 *   name: Admin Dashboard
 *   description: Analytics and overview
 */

const router = require('express').Router();
const { getOverview } = require('../controllers/admin.dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { ROLES } = require('../utils/constants');

const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];
const canReadDashboard = requirePermission('Dashboard', 'read');

/**
 * @swagger
 * /api/admin/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved
 */
router.get('/overview', isAdmin, canReadDashboard, getOverview);

module.exports = router;
