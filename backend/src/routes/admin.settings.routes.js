// src/routes/admin.settings.routes.js

/**
 * @swagger
 * tags:
 *   name: System Settings
 *   description: Global application settings
 */

const router = require('express').Router();
const { getSettings, updateSettings, getSystemStatus } = require('../controllers/admin.settings.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { ROLES } = require('../utils/constants');

const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];
const canReadSettings = requirePermission('Settings', 'read');
const canManageSettings = requirePermission('Settings', 'manage');

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Get system settings
 *     tags: [System Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved
 */
router.get('/', isAdmin, canReadSettings, getSettings);

/**
 * @swagger
 * /api/admin/settings/system/status:
 *   get:
 *     summary: Get system status
 *     tags: [System Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System status retrieved
 */
router.get('/system/status', isAdmin, canReadSettings, getSystemStatus);

/**
 * @swagger
 * /api/admin/settings:
 *   put:
 *     summary: Update system settings
 *     tags: [System Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.put('/', isAdmin, canManageSettings, updateSettings);

module.exports = router;
