// src/routes/index.js
// Central barrel — mounts all routers onto the Express app.

const router = require('express').Router();

const customerRoutes = require('./customer.routes');
const customerBookingRoutes = require('./customer.booking.routes');
const driverRoutes   = require('./driver.routes');
const driverBookingRoutes = require('./driver.booking.routes');
const adminRoutes    = require('./admin.routes');
const adminBookingRoutes = require('./admin.booking.routes');
const adminVehicleRoutes = require('./admin.vehicle.routes');
const customerVehicleRoutes = require('./customer.vehicle.routes');
const authRoutes     = require('./auth.routes');
const paymentRoutes  = require('./payment.routes');
const couponRoutes   = require('./coupon.routes');
const invoiceRoutes  = require('./invoice.routes');
const earningsRoutes = require('./earnings.routes');
const adminDashboardRoutes = require('./admin.dashboard.routes');
const adminSettingsRoutes = require('./admin.settings.routes');
const adminCmsRoutes = require('./admin.cms.routes');
const adminContactRoutes = require('./admin.contact.routes');
const adminRoleRoutes = require('./admin.role.routes');
const healthRoutes = require('./health.routes');
const notificationRoutes = require('./notification.routes');
const reviewRoutes = require('./review.routes');
const adminUserRoutes = require('./admin.user.routes');
const adminCustomerRoutes = require('./admin.customer.routes');
const adminDriverRoutes = require('./admin.driver.routes');
const adminDocumentRoutes = require('./admin.document.routes');
const auditRoutes = require('./audit.routes');
const systemRoutes = require('./system.routes');

const mapsRoutes = require('./maps.routes');
const ridesRoutes = require('./rides.routes');

// ── Health Monitoring ─────────────────────────────────────────────────────────
router.use('/health', healthRoutes);

const apiLogger = require('../middleware/apiLogger.middleware');

// ── Route mounting ────────────────────────────────────────────────────────────
router.use('/maps',     mapsRoutes);
router.use('/rides',    ridesRoutes);
router.use('/admin',    adminRoutes);
router.use('/admin/bookings', adminBookingRoutes);
router.use('/customer', apiLogger, customerRoutes);
router.use('/customer/bookings', apiLogger, customerBookingRoutes);
router.use('/customer/vehicles', apiLogger, customerVehicleRoutes);
router.use('/driver/bookings', apiLogger, driverBookingRoutes);
router.use('/driver', apiLogger, driverRoutes);
router.use('/auth',     authRoutes);

// Financial routes
router.use('/payments', paymentRoutes);
router.use('/coupons', couponRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/earnings', earningsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reviews', reviewRoutes);

// Phase 6 Admin routes
router.use('/admin/dashboard', adminDashboardRoutes);
router.use('/admin/settings', adminSettingsRoutes);
router.use('/admin/cms', adminCmsRoutes);
router.use('/admin/roles', adminRoleRoutes);
router.use('/admin/admin-users', adminUserRoutes);
router.use('/admin/customers', adminCustomerRoutes);
router.use('/admin/drivers', adminDriverRoutes);
router.use('/admin/documents', adminDocumentRoutes);
router.use('/admin/audit-logs', auditRoutes);
router.use('/admin/vehicles', adminVehicleRoutes);

// Public/Admin Contact Routes
router.use('/contact', adminContactRoutes);

// System Monitoring
router.use('/system', systemRoutes);

module.exports = router;
