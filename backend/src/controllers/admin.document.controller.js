// src/controllers/admin.document.controller.js

const Driver = require('../models/Driver.model');
const { sendSuccess } = require('../helpers/response.helper');
const asyncHandler = require('../utils/asyncHandler');
const { DRIVER_STATUS } = require('../utils/constants');

/**
 * @route   GET /api/admin/documents
 * @desc    Get all driver documents flattened for the admin panel
 * @access  Private (Admin)
 */
const getAllDocuments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', status = 'All', type = 'All' } = req.query;
  
  // Find all drivers that have a documents object
  const drivers = await Driver.find({ documents: { $exists: true, $ne: null } }).sort({ createdAt: -1 });
  
  let allDocuments = [];

  // Flatten documents
  drivers.forEach(driver => {
    const docs = driver.documents;
    if (!docs) return;

    // Helper to format a single document
    const addDoc = (docType, docUrl) => {
      if (!docUrl) return; // Skip if not uploaded
      
      allDocuments.push({
        id: `DOC-${driver._id}-${docType.replace(/\s+/g, '-')}`,
        driverId: driver._id,
        driverName: driver.fullName,
        driverPhone: driver.phoneNumber,
        driverEmail: driver.email,
        driverAvatar: driver.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.fullName)}&background=random`,
        driverApprovalStatus: driver.driverStatus,
        vehicleNumber: driver.vehicle?.registrationNumber || 'N/A',
        vehicleType: driver.vehicle?.type || 'N/A',
        city: driver.address?.city || 'N/A',
        type: docType,
        url: docUrl,
        // Because the schema currently doesn't store individual document statuses,
        // we derive it from the driver status or mock it as Pending if driver is pending.
        status: driver.driverStatus === DRIVER_STATUS.APPROVED ? 'Approved' : 'Pending',
        uploadedAt: driver.createdAt,
        metadata: {
          fileType: 'image/jpeg',
          size: 1024 * 1024,
          lastUpdated: driver.updatedAt
        }
      });
    };

    addDoc('Aadhaar Front', docs.aadhaarFront);
    addDoc('Aadhaar Back', docs.aadhaarBack);
    addDoc('Driving License Front', docs.licenseFront);
    addDoc('Driving License Back', docs.licenseBack);
    addDoc('RC Front', docs.rcFront);
    addDoc('RC Back', docs.rcBack);
    addDoc('Insurance Certificate', docs.insuranceCertificate);
    addDoc('PUC Certificate', docs.pucCertificate);
    addDoc('Selfie Photo', docs.selfiePhoto);
    addDoc('Vehicle Front Photo', docs.vehicleFrontPhoto);
  });

  // Apply Filters
  if (search) {
    const s = search.toLowerCase();
    allDocuments = allDocuments.filter(d => 
      d.driverName.toLowerCase().includes(s) || 
      d.driverId.toString().toLowerCase().includes(s) ||
      d.vehicleNumber.toLowerCase().includes(s) ||
      d.type.toLowerCase().includes(s)
    );
  }

  if (status && status !== 'All') {
    allDocuments = allDocuments.filter(d => d.status === status);
  }

  if (type && type !== 'All') {
    allDocuments = allDocuments.filter(d => d.type === type);
  }

  // Pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const start = (pageNum - 1) * limitNum;
  const paginatedDocs = allDocuments.slice(start, start + limitNum);

  return sendSuccess(res, 200, 'Documents fetched successfully', {
    data: paginatedDocs,
    total: allDocuments.length,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(allDocuments.length / limitNum)
  });
});

module.exports = {
  getAllDocuments
};
