// src/routes/review.routes.js

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Trip reviews and ratings
 */

const router = require('express').Router();
const { createReview, replyToReview, getDriverReviews, moderateReview } = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

/**
 * @swagger
 * /api/v1/reviews/driver/{driverId}:
 *   get:
 *     summary: Get reviews for a driver
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reviews fetched
 */
router.get('/driver/:driverId', getDriverReviews);

/**
 * @swagger
 * /api/v1/reviews:
 *   post:
 *     summary: Create a review for a completed booking (Customer)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Review submitted
 */
router.post('/', [authenticate, requireRole(ROLES.CUSTOMER)], createReview);

/**
 * @swagger
 * /api/v1/reviews/{id}/reply:
 *   post:
 *     summary: Reply to a customer review (Driver)
 *     tags: [Reviews]
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
 *         description: Reply submitted
 */
router.post('/:id/reply', [authenticate, requireRole(ROLES.DRIVER)], replyToReview);

/**
 * @swagger
 * /api/v1/reviews/admin/{id}/status:
 *   patch:
 *     summary: Moderate a review (Admin)
 *     tags: [Reviews]
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
 *         description: Status updated
 */
router.patch('/admin/:id/status', [authenticate, requireRole(ROLES.ADMIN)], moderateReview);

module.exports = router;
