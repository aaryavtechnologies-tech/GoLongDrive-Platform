const AuditLog = require('../models/AuditLog.model');
const { sendSuccess } = require('../helpers/response.helper');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all audit logs
 * @route   GET /api/admin/audit-logs
 */
const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, action, module: filterModule, startDate, endDate } = req.query;

  const query = {};

  if (search) {
    // We would need to search through admin's name, but audit logs store admin objectId.
    // A better approach is to use aggregation or populate and filter if needed, 
    // but for simple cases we just search action or module.
    // If we want to support search by admin name, we can do it via a simple lookup or populate.
    query.$or = [
      { action: { $regex: search, $options: 'i' } },
      { module: { $regex: search, $options: 'i' } }
    ];
  }

  if (action) query.action = action;
  if (filterModule) query.module = filterModule;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const logs = await AuditLog.find(query)
    .populate('admin', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await AuditLog.countDocuments(query);

  return sendSuccess(res, 200, 'Audit logs retrieved successfully', {
    data: logs,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    }
  });
});

module.exports = {
  getAuditLogs,
};
