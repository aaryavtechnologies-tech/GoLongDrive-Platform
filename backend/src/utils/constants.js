// src/utils/constants.js
// Centralised application constants — roles, statuses, etc.

const ROLES = Object.freeze({
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  DRIVER: 'driver',
});

const DRIVER_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

const ONLINE_STATUS = Object.freeze({
  OFFLINE: 'offline',
  ONLINE: 'online',
});

const AVAILABILITY_STATUS = Object.freeze({
  AVAILABLE: 'available',
  BUSY: 'busy',
});

const OTP_EXPIRY_MINUTES = 10;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 10;

// ── Phase 3: Booking Constants ────────────────────────────────────────────────

const TRIP_TYPES = Object.freeze({
  ONE_WAY: 'One Way',
  ROUND_TRIP: 'Round Trip',
  AIRPORT_PICKUP: 'Airport Pickup',
  AIRPORT_DROP: 'Airport Drop',
  MULTI_DAY_RENTAL: 'Multi-Day Rental',
  CUSTOM_TOUR: 'Custom Tour Package',
});

const RIDE_STATUS = Object.freeze({
  PENDING: 'Pending',
  SEARCHING_DRIVER: 'Searching Driver',
  DRIVER_ASSIGNED: 'Driver Assigned',
  DRIVER_ACCEPTED: 'Driver Accepted',
  DRIVER_REJECTED: 'Driver Rejected',
  CONFIRMED: 'Confirmed',
  DRIVER_ARRIVING: 'Driver Arriving',
  TRIP_STARTED: 'Trip Started',
  TRIP_COMPLETED: 'Trip Completed',
  CANCELLED_BY_CUSTOMER: 'Cancelled by Customer',
  CANCELLED_BY_DRIVER: 'Cancelled by Driver',
  CANCELLED_BY_ADMIN: 'Cancelled by Admin',
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'Pending',
  ADVANCE_PAID: 'Advance Paid',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  PARTIALLY_REFUNDED: 'Partially Refunded',
});

const PAYMENT_METHODS = Object.freeze({
  CASH: 'Cash',
  ONLINE: 'Online',
  PARTIAL_ADVANCE: 'Partial Advance',
});

const GATEWAYS = Object.freeze({
  RAZORPAY: 'Razorpay',
  STRIPE: 'Stripe',
  CASHFREE: 'Cashfree',
  TEST: 'Test',
});

const DISCOUNT_TYPES = Object.freeze({
  FLAT: 'Flat',
  PERCENTAGE: 'Percentage',
});

const INVOICE_STATUS = Object.freeze({
  GENERATED: 'Generated',
  CANCELLED: 'Cancelled',
});

const SETTLEMENT_STATUS = Object.freeze({
  PENDING: 'Pending',
  SETTLED: 'Settled',
  FAILED: 'Failed',
});

module.exports = {
  ROLES,
  DRIVER_STATUS,
  ONLINE_STATUS,
  AVAILABILITY_STATUS,
  OTP_EXPIRY_MINUTES,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE_MB,
  TRIP_TYPES,
  RIDE_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  GATEWAYS,
  DISCOUNT_TYPES,
  INVOICE_STATUS,
  SETTLEMENT_STATUS,
};
