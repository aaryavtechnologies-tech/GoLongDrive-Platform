// src/routes/notification.routes.js

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notification management
 */

const router = require('express').Router();
const { getMyNotifications, markAsRead, deleteNotification, adminBroadcast } = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { ROLES } = require('../utils/constants');

// All logged-in users
router.use(authenticate);

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get my notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved
 */
router.get('/', getMyNotifications);

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
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
 *         description: Notification marked as read
 */
router.patch('/:id/read', markAsRead);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
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
 *         description: Notification deleted
 */
router.delete('/:id', deleteNotification);

// Admin Broadcast
const isAdmin = requireRole(ROLES.ADMIN);
const canManageNotifs = requirePermission('Notifications', 'manage');

/**
 * @swagger
 * /api/v1/notifications/broadcast:
 *   post:
 *     summary: Broadcast a notification (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userType:
 *                 type: string
 *                 example: 'Customer'
 *               title:
 *                 type: string
 *                 example: 'System Update'
 *               message:
 *                 type: string
 *                 example: 'Maintenance at midnight'
 *     responses:
 *       200:
 *         description: Broadcast sent
 */
router.post('/broadcast', isAdmin, canManageNotifs, adminBroadcast);

module.exports = router;
