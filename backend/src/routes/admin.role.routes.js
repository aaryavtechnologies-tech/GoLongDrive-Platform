// src/routes/admin.role.routes.js

/**
 * @swagger
 * tags:
 *   name: Roles & Permissions
 *   description: RBAC management
 */

const router = require('express').Router();
const { createRole, getAllRoles, updateRole, deleteRole, getAllPermissions } = require('../controllers/admin.role.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { ROLES } = require('../utils/constants');

const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];
const canManageRoles = requirePermission('Roles', 'manage');

/**
 * @swagger
 * /api/admin/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles & Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles retrieved
 *   post:
 *     summary: Create a role
 *     tags: [Roles & Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Role created
 */
router.post('/', isAdmin, canManageRoles, createRole);
router.get('/', isAdmin, canManageRoles, getAllRoles);

/**
 * @swagger
 * /api/admin/roles/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Roles & Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role updated
 */
router.put('/:id', isAdmin, canManageRoles, updateRole);

/**
 * @swagger
 * /api/admin/roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles & Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role deleted
 */
router.delete('/:id', isAdmin, canManageRoles, deleteRole);

/**
 * @swagger
 * /api/admin/roles/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Roles & Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions retrieved
 */
router.get('/permissions', isAdmin, canManageRoles, getAllPermissions);

module.exports = router;
