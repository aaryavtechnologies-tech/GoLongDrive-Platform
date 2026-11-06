// src/routes/ticket.routes.js

const router = require('express').Router();
const {
  createTicket,
  getMyTickets,
  getTicketById,
  replyToTicket,
  getAdminTickets,
  updateTicketStatus,
} = require('../controllers/ticket.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const isAuth = [authenticate];
const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

// ── Customer & Driver Routes ──────────────────────────────────────────────────
router.post('/', isAuth, createTicket);
router.get('/my-tickets', isAuth, getMyTickets);
router.get('/:id', isAuth, getTicketById);
router.post('/:id/reply', isAuth, replyToTicket);

// ── Admin Routes ──────────────────────────────────────────────────────────────
router.get('/admin/all', isAdmin, getAdminTickets);
router.patch('/admin/:id/status', isAdmin, updateTicketStatus);

module.exports = router;

