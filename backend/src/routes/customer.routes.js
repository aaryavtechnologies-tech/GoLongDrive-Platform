// src/routes/customer.routes.js

/**
 * @swagger
 * tags:
 *   name: Customer
 *   description: Customer authentication & profile management
 */

const router = require('express').Router();
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTP,
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/customer.controller');

const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { uploadProfileImage } = require('../middleware/upload.middleware');
const V = require('../validators/customer.validator');
const { ROLES } = require('../utils/constants');

const isCustomer = [authenticate, requireRole(ROLES.CUSTOMER)];

// ─────────────────────────────────────────────────────────────────────────────
//  Public routes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/customer/register:
 *   post:
 *     summary: Register a new customer
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, phoneNumber, password]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Ravi Kumar
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ravi@example.com
 *               phoneNumber:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 example: Ravi@1234
 *     responses:
 *       201:
 *         description: Registration successful
 *       409:
 *         description: Email or phone already registered
 *       422:
 *         description: Validation error
 */
router.post('/register', V.registerCustomer, validate, register);

/**
 * @swagger
 * /api/customer/login:
 *   post:
 *     summary: Customer login
 *     tags: [Customer]
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', V.loginCustomer, validate, login);

/**
 * @swagger
 * /api/customer/forgot-password:
 *   post:
 *     summary: Send password reset email
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset link sent (always returns 200 to prevent enumeration)
 */
router.post('/forgot-password', V.forgotPassword, validate, forgotPassword);

/**
 * @swagger
 * /api/customer/reset-password:
 *   post:
 *     summary: Reset password using token from email
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', V.resetPassword, validate, resetPassword);

// ─────────────────────────────────────────────────────────────────────────────
//  Protected routes (customer only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/customer/logout:
 *   post:
 *     summary: Customer logout
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', isCustomer, logout);

/**
 * @swagger
 * /api/customer/send-otp:
 *   post:
 *     summary: Send email OTP for verification
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OTP sent
 *       401:
 *         description: Unauthorized
 */
router.post('/send-otp', isCustomer, sendOTP);

/**
 * @swagger
 * /api/customer/verify-otp:
 *   post:
 *     summary: Verify email OTP
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp]
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-otp', isCustomer, V.verifyOTP, validate, verifyOTP);

/**
 * @swagger
 * /api/customer/profile:
 *   get:
 *     summary: Get customer profile
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', isCustomer, getProfile);

/**
 * @swagger
 * /api/customer/profile:
 *   put:
 *     summary: Update customer profile (supports image upload)
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', isCustomer, uploadProfileImage, V.updateProfile, validate, updateProfile);

/**
 * @swagger
 * /api/customer/change-password:
 *   patch:
 *     summary: Change password
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 *       401:
 *         description: Current password incorrect
 */
router.patch('/change-password', isCustomer, V.changePassword, validate, changePassword);

module.exports = router;
