// src/routes/payment.routes.js

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management for bookings
 */

const router = require('express').Router();
const { createOrder, verifyPayment, getPaymentHistory, getAllPayments } = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const isCustomer = [authenticate, requireRole(ROLES.CUSTOMER)];
const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

/**
 * @swagger
 * /api/customer/payments/order:
 *   post:
 *     summary: Create a payment order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 example: "Partial Advance"
 *     responses:
 *       200:
 *         description: Order created
 */
// Customer
router.post('/order', isCustomer, createOrder);

/**
 * @swagger
 * /api/customer/payments/verify:
 *   post:
 *     summary: Verify a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment verified
 */
router.post('/verify', isCustomer, verifyPayment);

/**
 * @swagger
 * /api/customer/payments/history:
 *   get:
 *     summary: Get payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment history retrieved
 */
router.get('/history', isCustomer, getPaymentHistory);

/**
 * @swagger
 * /api/admin/payments/all:
 *   get:
 *     summary: Get all payments globally
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All payments retrieved
 */
// Admin
router.get('/all', isAdmin, getAllPayments);

module.exports = router;
