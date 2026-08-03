// src/routes/admin.document.routes.js

const router = require('express').Router();
const { getAllDocuments } = require('../controllers/admin.document.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

/**
 * @swagger
 * /api/admin/documents:
 *   get:
 *     summary: Get all pending/uploaded driver documents
 *     tags: [Admin Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of documents
 */
router.get('/', isAdmin, getAllDocuments);

module.exports = router;
