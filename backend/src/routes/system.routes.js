const express = require('express');
const {
  getServerMetrics,
  getDatabaseStatus,
  getPm2Status,
  getServerLogs
} = require('../controllers/system.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication and admin authorization to all system routes
router.use(protect);
router.use(authorize('admin'));

router.get('/metrics', getServerMetrics);
router.get('/database', getDatabaseStatus);
router.get('/pm2', getPm2Status);
router.get('/logs', getServerLogs);

module.exports = router;
