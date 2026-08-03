// src/routes/admin.customer.routes.js

const router = require('express').Router();
const { getAllCustomers } = require('../controllers/admin.customer.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

/**
 * @swagger
 * /api/admin/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Admin Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customers
 */
router.get('/', isAdmin, getAllCustomers);

module.exports = router;
