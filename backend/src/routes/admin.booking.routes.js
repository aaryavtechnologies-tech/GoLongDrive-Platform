// src/routes/admin.booking.routes.js

/**
 * @swagger
 * tags:
 *   name: Admin - Bookings
 *   description: Admin ride booking management
 */

const router = require('express').Router();
const {
  getAllBookings,
  getBookingDetails,
  updateBooking,
  cancelBooking,
  assignDriver,
  autoAssignDriver,
  reassignDriver,
  removeDriver,
  forceCompleteRide,
  getAvailableDrivers,
  getDashboardStats
} = require('../controllers/admin.booking.controller');

const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const V = require('../validators/booking.validator');
const { ROLES } = require('../utils/constants');

const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

/**
 * @swagger
 * /api/admin/bookings:
 *   get:
 *     summary: Get all bookings (with filters)
 *     tags: [Admin - Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: vehicleType
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bookings retrieved
 */
router.get('/', isAdmin, V.filterBookingsValidator, validate, getAllBookings);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard stats
 *     tags: [Admin - Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved
 */
router.get('/dashboard', isAdmin, getDashboardStats);

/**
 * @swagger
 * /api/admin/bookings/{id}:
 *   get:
 *     summary: Get booking details
 *     tags: [Admin - Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking details retrieved
 */
router.get('/:id', isAdmin, V.getBookingDetailsValidator, validate, getBookingDetails);

/**
 * @swagger
 * /api/admin/bookings/{id}:
 *   put:
 *     summary: Update booking
 *     tags: [Admin - Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pickupDate: { type: string, format: date }
 *               numberOfPassengers: { type: number }
 *     responses:
 *       200:
 *         description: Booking updated successfully
 */
router.put('/:id', isAdmin, V.updateBookingValidator, validate, updateBooking);

/**
 * @swagger
 * /api/admin/bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel booking
 *     tags: [Admin - Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string, example: "Driver unavailable" }
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 */
router.patch('/:id/cancel', isAdmin, V.cancelBookingValidator, validate, cancelBooking);

/**
 * @swagger
 * /api/admin/bookings/{id}/assign-driver:
 *   patch:
 *     summary: Assign driver to booking (placeholder)
 *     tags: [Admin - Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [driverId]
 *             properties:
 *               driverId: { type: string }
 *     responses:
 *       200:
 *         description: Driver assigned successfully
 */
router.patch('/:id/assign-driver', isAdmin, [
  ...V.getBookingDetailsValidator,
  require('express-validator').body('driverId').isMongoId().withMessage('Invalid driver ID')
], validate, assignDriver);

router.post('/:id/auto-assign', isAdmin, autoAssignDriver);
router.patch('/:id/reassign-driver', isAdmin, reassignDriver);
router.patch('/:id/remove-driver', isAdmin, removeDriver);
router.patch('/:id/force-complete', isAdmin, forceCompleteRide);
router.get('/drivers/available', isAdmin, getAvailableDrivers);

module.exports = router;
