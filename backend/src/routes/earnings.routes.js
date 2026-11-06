// src/routes/earnings.routes.js

const router = require('express').Router();
const {
  getDriverEarningsDashboard,
  requestPayout,
  getDriverPayouts,
  getDriverBankDetails,
  updateDriverBankDetails,
  getAdminPayouts,
  updatePayoutStatus,
  getAdminEarningsDashboard,
} = require('../controllers/earnings.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const isDriver = [authenticate, requireRole(ROLES.DRIVER)];
const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

// ── Driver Routes ─────────────────────────────────────────────────────────────
router.get('/driver/dashboard', isDriver, getDriverEarningsDashboard);
router.post('/driver/payout-request', isDriver, requestPayout);
router.get('/driver/payouts', isDriver, getDriverPayouts);
router.get('/driver/bank-details', isDriver, getDriverBankDetails);
router.put('/driver/bank-details', isDriver, updateDriverBankDetails);

// ── Admin Routes ──────────────────────────────────────────────────────────────
router.get('/admin/dashboard', isAdmin, getAdminEarningsDashboard);
router.get('/admin/payouts', isAdmin, getAdminPayouts);
router.patch('/admin/payouts/:id/status', isAdmin, updatePayoutStatus);

module.exports = router;
