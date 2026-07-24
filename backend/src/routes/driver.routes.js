// src/routes/driver.routes.js

/**
 * @swagger
 * tags:
 *   name: Driver
 *   description: Driver authentication & profile management
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
} = require('../controllers/driver.controller');

const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { uploadProfileImage } = require('../middleware/upload.middleware');
const V = require('../validators/driver.validator');
const { ROLES } = require('../utils/constants');

const isDriver = [authenticate, requireRole(ROLES.DRIVER)];

// ─────────────────────────────────────────────────────────────────────────────
//  Public routes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/driver/register:
 *   post:
 *     summary: Register a new driver
 *     tags: [Driver]
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
 *                 example: Arjun Singh
 *               email:
 *                 type: string
 *                 format: email
 *                 example: arjun@example.com
 *               phoneNumber:
 *                 type: string
 *                 example: "9123456789"
 *               password:
 *                 type: string
 *                 example: Driver@1234
 *     responses:
 *       201:
 *         description: Driver registration successful (status pending)
 *       409:
 *         description: Email or phone already registered
 *       422:
 *         description: Validation error
 */
router.post('/register', V.registerDriver, validate, register);

/**
 * @swagger
 * /api/driver/login:
 *   post:
 *     summary: Driver login
 *     tags: [Driver]
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
router.post('/login', V.loginDriver, validate, login);

/**
 * @swagger
 * /api/driver/forgot-password:
 *   post:
 *     summary: Send password reset email to driver
 *     tags: [Driver]
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
 *         description: Reset link sent
 */
router.post('/forgot-password', V.forgotPassword, validate, forgotPassword);

/**
 * @swagger
 * /api/driver/reset-password:
 *   post:
 *     summary: Reset driver password using token
 *     tags: [Driver]
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
//  Protected routes (driver only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/driver/logout:
 *   post:
 *     summary: Driver logout (also sets onlineStatus to offline)
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', isDriver, logout);

/**
 * @swagger
 * /api/driver/send-otp:
 *   post:
 *     summary: Send email OTP for verification
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OTP sent
 */
router.post('/send-otp', isDriver, sendOTP);

/**
 * @swagger
 * /api/driver/verify-otp:
 *   post:
 *     summary: Verify email OTP
 *     tags: [Driver]
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
 *                 example: "654321"
 *     responses:
 *       200:
 *         description: Email verified
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-otp', isDriver, V.verifyOTP, validate, verifyOTP);

/**
 * @swagger
 * /api/driver/profile:
 *   get:
 *     summary: Get driver profile
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched
 */
router.get('/profile', isDriver, getProfile);

/**
 * @swagger
 * /api/driver/profile:
 *   put:
 *     summary: Update driver profile (supports image upload)
 *     tags: [Driver]
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
router.put('/profile', isDriver, uploadProfileImage, V.updateProfile, validate, updateProfile);

/**
 * @swagger
 * /api/driver/change-password:
 *   patch:
 *     summary: Change driver password
 *     tags: [Driver]
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
 */
router.patch('/change-password', isDriver, V.changePassword, validate, changePassword);

module.exports = router;
