const express = require('express');
const router = express.Router();
const {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  suggestCustomTour,
  uploadPackageImage,
} = require('../controllers/tourPackage.controller');

const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { uploadTourPackageImage } = require('../middleware/upload.middleware');
const { ROLES } = require('../utils/constants');

// Public routes
router.get('/', getAllPackages);
router.get('/:id', getPackageById);

// Protected routes
router.use(authenticate);

// Customer only
router.post('/suggest', requireRole(ROLES.CUSTOMER), suggestCustomTour);

// Admin only routes
router.use(requireRole(ROLES.ADMIN));
router.post('/upload-image', uploadTourPackageImage, uploadPackageImage);
router.post('/', uploadTourPackageImage, createPackage);
router.put('/:id', uploadTourPackageImage, updatePackage);
router.delete('/:id', deletePackage);

module.exports = router;
