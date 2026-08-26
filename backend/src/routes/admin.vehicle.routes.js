// src/routes/admin.vehicle.routes.js

const router = require('express').Router();
const {
  getAllVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  uploadImage,
} = require('../controllers/admin.vehicle.controller');

const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { uploadVehicleImage } = require('../middleware/upload.middleware');
const { ROLES } = require('../utils/constants');

const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

router.route('/')
  .get(isAdmin, getAllVehicles)
  .post(isAdmin, createVehicle);

router.post('/upload-image', isAdmin, uploadVehicleImage, uploadImage);

router.route('/:id')
  .put(isAdmin, updateVehicle)
  .delete(isAdmin, deleteVehicle);

module.exports = router;
