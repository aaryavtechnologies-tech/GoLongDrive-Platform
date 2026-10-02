const DeletionRequest = require('../models/DeletionRequest');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Public route to submit a deletion request
exports.submitDeletionRequest = asyncHandler(async (req, res) => {
  const { name, email, phone, userType, reason } = req.body;
  
  if (!name || !email || !phone || !userType) {
    throw ApiError.badRequest('Name, email, phone and userType are required');
  }
  
  if (!['User', 'Driver'].includes(userType)) {
    throw ApiError.badRequest('Invalid userType. Must be User or Driver');
  }

  const request = await DeletionRequest.create({
    name,
    email,
    phone,
    userType,
    reason
  });

  return sendSuccess(res, 201, 'Account deletion request submitted successfully', { request });
});

// Admin route to list deletion requests
exports.getDeletionRequests = asyncHandler(async (req, res) => {
  const requests = await DeletionRequest.find().sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'Deletion requests retrieved', { requests });
});

// Admin route to process/update status of a deletion request
exports.processDeletionRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const request = await DeletionRequest.findByIdAndUpdate(
    id,
    { status: 'Processed' },
    { new: true }
  );
  
  if (!request) {
    throw ApiError.notFound('Deletion request not found');
  }

  return sendSuccess(res, 200, 'Deletion request processed', { request });
});
