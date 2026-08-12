// src/routes/admin.customer.routes.js

const router = require('express').Router();
const { getAllCustomers, deleteCustomer, createCustomer } = require('../controllers/admin.customer.controller');
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

/**
 * @swagger
 * /api/admin/customers:
 *   post:
 *     summary: Create a customer manually
 *     tags: [Admin Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Customer created
 */
router.post('/', isAdmin, createCustomer);

/**
 * @swagger
 * /api/admin/customers/{id}:
 *   delete:
 *     summary: Delete a customer
 *     tags: [Admin Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 */
router.delete('/:id', isAdmin, deleteCustomer);

module.exports = router;
