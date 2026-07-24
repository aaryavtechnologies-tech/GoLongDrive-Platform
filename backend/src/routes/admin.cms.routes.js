// src/routes/admin.cms.routes.js

/**
 * @swagger
 * tags:
 *   name: CMS
 *   description: Content Management System pages
 */

const router = require('express').Router();
const { getAllPages, getPageBySlug, createPage, updatePage, deletePage } = require('../controllers/admin.cms.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { ROLES } = require('../utils/constants');

const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

/**
 * @swagger
 * /api/admin/cms/page/{slug}:
 *   get:
 *     summary: Get a CMS page by slug
 *     tags: [CMS]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CMS page retrieved
 */
// Public route to get a single page
router.get('/page/:slug', getPageBySlug);

/**
 * @swagger
 * /api/admin/cms:
 *   get:
 *     summary: Get all CMS pages
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CMS pages retrieved
 *   post:
 *     summary: Create a CMS page
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: CMS page created
 */
// Protected Admin Routes
router.get('/', isAdmin, requirePermission('CMS', 'read'), getAllPages);
router.post('/', isAdmin, requirePermission('CMS', 'create'), createPage);

/**
 * @swagger
 * /api/admin/cms/{id}:
 *   put:
 *     summary: Update a CMS page
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CMS page updated
 *   delete:
 *     summary: Delete a CMS page
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CMS page deleted
 */
router.put('/:id', isAdmin, requirePermission('CMS', 'update'), updatePage);
router.delete('/:id', isAdmin, requirePermission('CMS', 'delete'), deletePage);

module.exports = router;
