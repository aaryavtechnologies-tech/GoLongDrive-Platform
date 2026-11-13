// src/routes/coupon.routes.js

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon management
 */

const router = require('express').Router();
const {
  createCoupon,
  updateCoupon,
  getAllCoupons,
  getCouponById,
  deleteCoupon,
  applyCoupon,
  getAvailableCoupons
} = require('../controllers/coupon.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const isCustomer = [authenticate, requireRole(ROLES.CUSTOMER)];
const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

// ── Admin Routes ──────────────────────────────────────────────────────────
router.get('/', isAdmin, getAllCoupons);
router.get('/all', isAdmin, getAllCoupons);
router.get('/:id', isAdmin, getCouponById);
router.post('/', isAdmin, createCoupon);
router.put('/:id', isAdmin, updateCoupon);
router.patch('/:id', isAdmin, updateCoupon);
router.delete('/:id', isAdmin, deleteCoupon);

// ── Customer Routes ───────────────────────────────────────────────────────
router.post('/apply', isCustomer, applyCoupon);
router.get('/available', isCustomer, getAvailableCoupons);

module.exports = router;
