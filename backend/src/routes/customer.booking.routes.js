// src/routes/customer.booking.routes.js

/**
 * @swagger
 * tags:
 *   name: Customer - Bookings
 *   description: Customer ride booking & management
 */

const router = require('express').Router();
const {
  createBooking,
  getBookingHistory,
  getUpcomingBookings,
  getCompletedBookings,
  getCancelledBookings,
  getBookingDetails,
  updateBooking,
  cancelBooking,
  getDashboardStats,
  getCurrentRide,
  getDriverDetails
} = require('../controllers/customer.booking.controller');

const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const V = require('../validators/booking.validator');
const { ROLES } = require('../utils/constants');

const isCustomer = [authenticate, requireRole(ROLES.CUSTOMER)];

/**
 * @swagger
 * /api/customer/bookings:
 *   post:
 *     summary: Create a new ride booking
 *     tags: [Customer - Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pickupAddress: { type: string, example: "123 MG Road" }
 *               pickupCity: { type: string, example: "Mumbai" }
 *               pickupState: { type: string, example: "Maharashtra" }
 *               pickupPincode: { type: string, example: "400001" }
 *               dropAddress: { type: string, example: "45FC FC Road" }
 *               dropCity: { type: string, example: "Pune" }
 *               dropState: { type: string, example: "Maharashtra" }
 *               dropPincode: { type: string, example: "411004" }
 *               tripType: { type: string, example: "One Way" }
 *               pickupDate: { type: string, format: date, example: "2026-08-01" }
 *               pickupTime: { type: string, example: "10:30 AM" }
 *               vehicleType: { type: string, example: "Sedan" }
 *               numberOfPassengers: { type: number, example: 2 }
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post('/', isCustomer, V.createBookingValidator, validate, createBooking);

/**
 * @swagger
 * /api/customer/bookings:
 *   get:
 *     summary: Get all bookings (History)
 *     tags: [Customer - Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookings retrieved
 */
router.get('/', isCustomer, getBookingHistory);

/**
 * @swagger
 * /api/customer/bookings/upcoming:
 *   get:
 *     summary: Get upcoming bookings
 *     tags: [Customer - Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upcoming bookings retrieved
 */
router.get('/upcoming', isCustomer, getUpcomingBookings);

/**
 * @swagger
 * /api/customer/bookings/completed:
 *   get:
 *     summary: Get completed bookings
 *     tags: [Customer - Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Completed bookings retrieved
 */
router.get('/completed', isCustomer, getCompletedBookings);

/**
 * @swagger
 * /api/customer/bookings/cancelled:
 *   get:
 *     summary: Get cancelled bookings
 *     tags: [Customer - Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cancelled bookings retrieved
 */
router.get('/cancelled', isCustomer, getCancelledBookings);

/**
 * @swagger
 * /api/customer/dashboard:
 *   get:
 *     summary: Get customer dashboard stats
 *     tags: [Customer - Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved
 */
router.get('/dashboard', isCustomer, getDashboardStats);

/**
 * @swagger
 * /api/customer/bookings/{id}:
 *   get:
 *     summary: Get booking details
 *     tags: [Customer - Bookings]
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
router.get('/:id', isCustomer, V.getBookingDetailsValidator, validate, getBookingDetails);

/**
 * @swagger
 * /api/customer/bookings/{id}:
 *   put:
 *     summary: Update booking (before driver assigned)
 *     tags: [Customer - Bookings]
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
router.put('/:id', isCustomer, V.updateBookingValidator, validate, updateBooking);

/**
 * @swagger
 * /api/customer/bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel booking
 *     tags: [Customer - Bookings]
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
 *               reason: { type: string, example: "Change of plans" }
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 */
router.patch('/:id/cancel', isCustomer, V.cancelBookingValidator, validate, cancelBooking);
router.get('/current/active', isCustomer, getCurrentRide);
router.get('/:id/driver', isCustomer, getDriverDetails);

module.exports = router;
