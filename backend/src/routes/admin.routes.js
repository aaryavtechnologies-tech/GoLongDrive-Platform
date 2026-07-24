// src/routes/admin.routes.js

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin authentication
 */

const router = require('express').Router();
const { login } = require('../controllers/admin.controller');
const { validate } = require('../middleware/validate.middleware');
const { emailRule } = require('../validators/auth.validator');
const { body } = require('express-validator');

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@taxiapp.com
 *               password:
 *                 type: string
 *                 example: Admin@1234
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  [emailRule, body('password').notEmpty().withMessage('Password is required')],
  validate,
  login
);

module.exports = router;
