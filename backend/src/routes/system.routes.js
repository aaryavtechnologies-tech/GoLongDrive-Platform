const express = require('express');
const {
  getServerMetrics,
  getDatabaseStatus,
  getPm2Status,
  getServerLogs
} = require('../controllers/system.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

// Apply authentication and admin authorization to all system routes
router.use(isAdmin);

router.get('/metrics', getServerMetrics);
router.get('/database', getDatabaseStatus);
router.get('/pm2', getPm2Status);
router.get('/logs', getServerLogs);

module.exports = router;
