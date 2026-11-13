// src/routes/admin.settings.routes.js

/**
 * @swagger
 * tags:
 *   name: System Settings
 *   description: Global application settings
 */

const router = require('express').Router();
const {
  getSettings,
  updateSettings,
  getSystemStatus,
  testEmailSettings,
} = require('../controllers/admin.settings.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { ROLES } = require('../utils/constants');

const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];
const canReadSettings = requirePermission('Settings', 'read');
const canManageSettings = requirePermission('Settings', 'manage');

router.get('/', isAdmin, canReadSettings, getSettings);
router.put('/', isAdmin, canManageSettings, updateSettings);
router.get('/system/status', isAdmin, canReadSettings, getSystemStatus);
router.post('/email/test', isAdmin, canManageSettings, testEmailSettings);
router.post('/test-email', isAdmin, canManageSettings, testEmailSettings);

module.exports = router;
