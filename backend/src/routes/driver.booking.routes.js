// src/routes/driver.booking.routes.js

/**
 * @swagger
 * tags:
 *   name: Driver - Ride Management
 *   description: Driver ride operations and status
 */

const router = require('express').Router();
const {
  toggleStatus,
  getCurrentRide,
  acceptRide,
  rejectRide,
  startRide,
  completeRide,
  cancelRide,
  getRideHistory,
  getDashboardStats
} = require('../controllers/driver.booking.controller');

const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const isDriver = [authenticate, requireRole(ROLES.DRIVER)];

router.patch('/status', isDriver, toggleStatus);
router.get('/rides/current', isDriver, getCurrentRide);
router.post('/rides/:id/accept', isDriver, acceptRide);
router.post('/rides/:id/reject', isDriver, rejectRide);
router.post('/rides/:id/start', isDriver, startRide);
router.post('/rides/:id/complete', isDriver, completeRide);
router.post('/rides/:id/cancel', isDriver, cancelRide);
router.get('/rides/history', isDriver, getRideHistory);
router.get('/dashboard', isDriver, getDashboardStats);

module.exports = router;
