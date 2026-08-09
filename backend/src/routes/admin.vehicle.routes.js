// src/routes/admin.vehicle.routes.js

const router = require('express').Router();
const {
  getAllVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/admin.vehicle.controller');

const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

router.route('/')
  .get(isAdmin, getAllVehicles)
  .post(isAdmin, createVehicle);

router.route('/:id')
  .put(isAdmin, updateVehicle)
  .delete(isAdmin, deleteVehicle);

module.exports = router;
