const router = require('express').Router();
const { getAuditLogs } = require('../controllers/audit.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { ROLES } = require('../utils/constants');

const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];
const canReadAuditLogs = requirePermission('Audit Logs', 'read');

router.use(isAdmin);
router.use(canReadAuditLogs);

/**
 * @swagger
 * tags:
 *   name: Audit Logs
 *   description: System audit logs
 */

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Get all audit logs
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by action or module
 *     responses:
 *       200:
 *         description: List of audit logs
 */
router.get('/', getAuditLogs);

module.exports = router;
