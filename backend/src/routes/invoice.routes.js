// src/routes/invoice.routes.js

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice generation and management
 */

const router = require('express').Router();
const { getCustomerInvoices, getInvoiceById, getAllInvoices } = require('../controllers/invoice.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const isCustomer = [authenticate, requireRole(ROLES.CUSTOMER)];
const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

/**
 * @swagger
 * /api/customer/invoices:
 *   get:
 *     summary: Get customer invoices
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoices retrieved
 */
// Customer
router.get('/', isCustomer, getCustomerInvoices);

/**
 * @swagger
 * /api/customer/invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Invoices]
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
 *         description: Invoice retrieved
 */
router.get('/:id', isCustomer, getInvoiceById);

/**
 * @swagger
 * /api/admin/invoices/all:
 *   get:
 *     summary: Get all invoices globally
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All invoices retrieved
 */
// Admin
router.get('/all', isAdmin, getAllInvoices);

module.exports = router;
