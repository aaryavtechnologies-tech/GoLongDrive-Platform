// src/middleware/permission.middleware.js

const Admin = require('../models/Admin.model');
const Role = require('../models/Role.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Require a specific permission for the admin user.
 * @param {string} module - The module name (e.g. 'Dashboard', 'Drivers', 'CMS')
 * @param {string} action - The action ('create', 'read', 'update', 'delete', 'manage')
 */
const requirePermission = (moduleName, action) => {
  return asyncHandler(async (req, res, next) => {
    // We assume authenticate and requireRole(ROLES.ADMIN) have already run, so req.user exists.
    if (!req.user || req.user.role !== 'admin') {
      throw ApiError.forbidden('Access denied. Admins only.');
    }

    const admin = await Admin.findById(req.user._id).populate({
      path: 'roleId',
      populate: { path: 'permissions' }
    });

    if (!admin || !admin.roleId) {
      // Fallback for legacy admins without a strict role assigned yet. 
      // Treat them as Super Admin to prevent lockdown, or throw error depending on strictness.
      // We will allow for now until full migration.
      return next(); 
    }

    const role = admin.roleId;

    // Check permissions
    const hasAccess = role.permissions.some(p => {
      const isModuleMatch = p.module === moduleName || p.module === 'All';
      const isActionMatch = p.action === action || p.action === 'manage';
      return isModuleMatch && isActionMatch;
    });

    if (!hasAccess && !role.isSystem) { // if isSystem is true, it's Super Admin
      throw ApiError.forbidden(`Missing permission: ${action} on ${moduleName}`);
    }

    next();
  });
};

module.exports = { requirePermission };
