const Admin = require('../models/Admin.model');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all admin users
 * @route   GET /api/admin/admin-users
 */
const getAllAdminUsers = asyncHandler(async (req, res) => {
  const admins = await Admin.find().select('-password').populate('roleId', 'name description');
  return sendSuccess(res, 200, 'Admin users retrieved successfully', admins);
});

/**
 * @desc    Create a new admin user
 * @route   POST /api/admin/admin-users
 */
const createAdminUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, roleId, isActive } = req.body;
  const existing = await Admin.findOne({ email });
  if (existing) {
    throw ApiError.badRequest('Email already exists');
  }
  const admin = await Admin.create({ name, email, password, role, roleId, isActive });
  const adminResponse = admin.toObject();
  delete adminResponse.password;
  return sendSuccess(res, 201, 'Admin user created successfully', adminResponse);
});

/**
 * @desc    Update an admin user
 * @route   PUT /api/admin/admin-users/:id
 */
const updateAdminUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, roleId, isActive } = req.body;

  const admin = await Admin.findById(id);
  if (!admin) {
    throw ApiError.notFound('Admin user not found');
  }

  if (email && email !== admin.email) {
    const existing = await Admin.findOne({ email });
    if (existing) throw ApiError.badRequest('Email already exists');
    admin.email = email;
  }

  if (name) admin.name = name;
  if (password) admin.password = password; // pre-save hook handles hashing
  if (role) admin.role = role;
  if (roleId) admin.roleId = roleId;
  if (isActive !== undefined) admin.isActive = isActive;

  await admin.save();
  
  const updatedAdmin = await Admin.findById(id).select('-password').populate('roleId', 'name description');
  return sendSuccess(res, 200, 'Admin user updated successfully', updatedAdmin);
});

/**
 * @desc    Delete an admin user
 * @route   DELETE /api/admin/admin-users/:id
 */
const deleteAdminUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const admin = await Admin.findById(id);
  if (!admin) throw ApiError.notFound('Admin user not found');

  // Ensure an admin doesn't delete themselves
  if (req.user && req.user.id === id) {
    throw ApiError.badRequest('Cannot delete your own account');
  }

  await admin.deleteOne();
  return sendSuccess(res, 200, 'Admin user deleted successfully');
});

module.exports = {
  getAllAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser
};
