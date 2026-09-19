const express = require('express');
const router = express.Router();
const {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  suggestCustomTour
} = require('../controllers/tourPackage.controller');

const { protect, authorize } = require('../middlewares/auth.middleware');
const { ROLES } = require('../utils/constants');

// Public routes (or partially protected depending on req.user which we can handle via optional auth if needed, but standard is public for listing)
// For now, let's keep list and get public
router.get('/', getAllPackages);
router.get('/:id', getPackageById);

// Protected routes
router.use(protect);

// Customer only
router.post('/suggest', authorize(ROLES.CUSTOMER), suggestCustomTour);

// Admin only routes
router.use(authorize(ROLES.ADMIN));
router.post('/', createPackage);
router.put('/:id', updatePackage);
router.delete('/:id', deletePackage);

module.exports = router;
