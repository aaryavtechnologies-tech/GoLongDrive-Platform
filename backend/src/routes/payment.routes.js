// src/routes/payment.routes.js

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management for bookings
 */

const router = require('express').Router();
const {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getRevenueStats,
  getRevenueTrends,
  getPaymentMethodsBreakdown,
  getAllPayments,
  processPaymentRefund,
} = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const isCustomer = [authenticate, requireRole(ROLES.CUSTOMER)];
const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

// ── Customer Routes ───────────────────────────────────────────────────────
router.post('/order', isCustomer, createOrder);
router.post('/verify', isCustomer, verifyPayment);
router.get('/history', isCustomer, getPaymentHistory);

// ── Admin Routes ──────────────────────────────────────────────────────────
router.get('/stats', isAdmin, getRevenueStats);
router.get('/trends', isAdmin, getRevenueTrends);
router.get('/methods', isAdmin, getPaymentMethodsBreakdown);
router.get('/all', isAdmin, getAllPayments);
router.get('/', isAdmin, getAllPayments);
router.post('/:id/refund', isAdmin, processPaymentRefund);

module.exports = router;
