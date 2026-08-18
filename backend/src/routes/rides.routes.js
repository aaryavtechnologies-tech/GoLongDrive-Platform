// src/routes/rides.routes.js
const router = require('express').Router();
const ridesController = require('../controllers/rides.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const isCustomer = [authenticate, requireRole(ROLES.CUSTOMER)];
const isDriver = [authenticate, requireRole(ROLES.DRIVER)];
const isUser = [authenticate]; // Admin, Customer, or Driver

/**
 * Endpoints for Long Rides / Long Distance
 */
router.post('/estimate', isCustomer, ridesController.estimateRide);
router.post('/book', isCustomer, ridesController.bookRide);
router.get('/:id', isUser, ridesController.getRideDetails);
router.get('/:id/boarding-pass', isUser, ridesController.getBoardingPass);
router.post('/:id/payment', isCustomer, ridesController.initiateRidePayment);
router.post('/:id/start', isDriver, ridesController.startRide);
router.post('/:id/complete', isDriver, ridesController.completeRide);

module.exports = router;
