// src/routes/admin.routes.js

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin authentication and profile
 */

const router = require('express').Router();
const { login, getProfile, updateProfile } = require('../controllers/admin.controller');
const { validate } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { emailRule } = require('../validators/auth.validator');
const { body } = require('express-validator');
const { ROLES } = require('../utils/constants');

const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

// ── Public Routes ─────────────────────────────────────────────────────────
router.post(
  '/login',
  [emailRule, body('password').notEmpty().withMessage('Password is required')],
  validate,
  login
);

// ── Authenticated Admin Profile Routes ────────────────────────────────────
router.get('/profile', isAdmin, getProfile);
router.get('/me', isAdmin, getProfile);
router.put('/profile', isAdmin, updateProfile);

module.exports = router;
