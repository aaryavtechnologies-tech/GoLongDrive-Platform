// src/routes/admin.contact.routes.js

/**
 * @swagger
 * tags:
 *   name: Contact & Support
 *   description: Support ticket management
 */

const router = require('express').Router();
const { submitTicket, getAllTickets, replyTicket } = require('../controllers/admin.contact.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

/**
 * @swagger
 * /api/contact/submit:
 *   post:
 *     summary: Submit a new contact ticket
 *     tags: [Contact & Support]
 *     responses:
 *       201:
 *         description: Ticket submitted
 */
// Public route to submit ticket
router.post('/submit', submitTicket);

// Admin Routes (using basic admin check, or could use Support permissions)
const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

/**
 * @swagger
 * /api/contact/all:
 *   get:
 *     summary: Get all contact tickets
 *     tags: [Contact & Support]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tickets retrieved
 */
router.get('/all', isAdmin, getAllTickets);

/**
 * @swagger
 * /api/contact/{id}/reply:
 *   post:
 *     summary: Reply to a ticket
 *     tags: [Contact & Support]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reply sent
 */
router.post('/:id/reply', isAdmin, replyTicket);

module.exports = router;
