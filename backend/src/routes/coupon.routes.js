// src/routes/coupon.routes.js

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon management
 */

const router = require('express').Router();
const { createCoupon, updateCoupon, getAllCoupons, deleteCoupon, applyCoupon, getAvailableCoupons } = require('../controllers/coupon.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const isCustomer = [authenticate, requireRole(ROLES.CUSTOMER)];
const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

/**
 * @swagger
 * /api/admin/coupons:
 *   post:
 *     summary: Create a coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Coupon created
 */
// Admin
router.post('/', isAdmin, createCoupon);

/**
 * @swagger
 * /api/admin/coupons/all:
 *   get:
 *     summary: Get all coupons
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupons retrieved
 */
router.get('/all', isAdmin, getAllCoupons);
router.put('/:id', isAdmin, updateCoupon);
router.delete('/:id', isAdmin, deleteCoupon);

/**
 * @swagger
 * /api/customer/coupons/apply:
 *   post:
 *     summary: Apply a coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupon applied
 */
// Customer
router.post('/apply', isCustomer, applyCoupon);

/**
 * @swagger
 * /api/customer/coupons/available:
 *   get:
 *     summary: Get available coupons
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available coupons retrieved
 */
router.get('/available', isCustomer, getAvailableCoupons);

module.exports = router;
