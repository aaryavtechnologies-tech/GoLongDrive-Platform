const router = require('express').Router();
const {
  getAllAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser
} = require('../controllers/admin.user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { ROLES } = require('../utils/constants');

const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];
const canManageAdmins = requirePermission('Admin Users', 'manage');

router.use(isAdmin);
router.use(canManageAdmins);

/**
 * @swagger
 * tags:
 *   name: Admin Users
 *   description: Admin user management
 */

/**
 * @swagger
 * /api/admin/admin-users:
 *   get:
 *     summary: Get all admin users
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of admin users
 */
router.get('/', getAllAdminUsers);

/**
 * @swagger
 * /api/admin/admin-users:
 *   post:
 *     summary: Create an admin user
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Admin user created
 */
router.post('/', createAdminUser);

/**
 * @swagger
 * /api/admin/admin-users/{id}:
 *   put:
 *     summary: Update an admin user
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin user updated
 */
router.put('/:id', updateAdminUser);

/**
 * @swagger
 * /api/admin/admin-users/{id}:
 *   delete:
 *     summary: Delete an admin user
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin user deleted
 */
router.delete('/:id', deleteAdminUser);

module.exports = router;
