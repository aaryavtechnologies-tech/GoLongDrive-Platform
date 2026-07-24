// src/controllers/admin.role.controller.js

const Role = require('../models/Role.model');
const Permission = require('../models/Permission.model');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   POST /api/admin/roles
 * @access  Private (Admin - requires 'manage' on 'Roles')
 */
const createRole = asyncHandler(async (req, res) => {
  const { name, description, permissionIds } = req.body;
  
  const existingRole = await Role.findOne({ name });
  if (existingRole) throw ApiError.badRequest('Role name already exists');

  const role = await Role.create({
    name,
    description,
    permissions: permissionIds
  });

  return sendSuccess(res, 201, 'Role created successfully', { role });
});

/**
 * @route   GET /api/admin/roles
 * @access  Private (Admin)
 */
const getAllRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find().populate('permissions');
  return sendSuccess(res, 200, 'Roles fetched', { roles });
});

/**
 * @route   PUT /api/admin/roles/:id
 * @access  Private (Admin)
 */
const updateRole = asyncHandler(async (req, res) => {
  const { name, description, permissionIds } = req.body;
  const role = await Role.findById(req.params.id);
  
  if (!role) throw ApiError.notFound('Role not found');
  if (role.isSystem) throw ApiError.badRequest('System roles cannot be modified directly');

  role.name = name || role.name;
  role.description = description || role.description;
  if (permissionIds) role.permissions = permissionIds;

  await role.save();
  return sendSuccess(res, 200, 'Role updated', { role });
});

/**
 * @route   GET /api/admin/permissions
 * @access  Private (Admin)
 */
const getAllPermissions = asyncHandler(async (req, res) => {
  const permissions = await Permission.find();
  return sendSuccess(res, 200, 'Permissions fetched', { permissions });
});

module.exports = {
  createRole,
  getAllRoles,
  updateRole,
  getAllPermissions
};
