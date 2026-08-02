// src/services/analytics.service.js

const Booking = require('../models/Booking.model');
const Driver = require('../models/Driver.model');
const Customer = require('../models/Customer.model');
const Payment = require('../models/Payment.model');
const Coupon = require('../models/Coupon.model');
const DriverEarning = require('../models/DriverEarning.model');
const { RIDE_STATUS, DRIVER_STATUS, ONLINE_STATUS, AVAILABILITY_STATUS, PAYMENT_STATUS } = require('../utils/constants');

const getDashboardOverview = async () => {
  const [
    totalCustomers,
    totalDrivers,
    pendingDrivers,
    driversOnline,
  ] = await Promise.all([
    Customer.countDocuments(),
    Driver.countDocuments(),
    Driver.countDocuments({ driverStatus: DRIVER_STATUS.PENDING }),
    Driver.countDocuments({ onlineStatus: ONLINE_STATUS.ONLINE }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    todayBookings,
    completedTrips,
    pendingPayments
  ] = await Promise.all([
    Booking.countDocuments({ createdAt: { $gte: today } }),
    Booking.countDocuments({ rideStatus: RIDE_STATUS.TRIP_COMPLETED }),
    Payment.countDocuments({ paymentStatus: PAYMENT_STATUS.PENDING })
  ]);

  const revenueStats = await DriverEarning.aggregate([
    { 
      $match: { createdAt: { $gte: today } }
    },
    { 
      $group: { 
        _id: null, 
        totalPlatformEarnings: { $sum: '$platformFee' },
      } 
    }
  ]);
  const todayRevenue = revenueStats[0] ? revenueStats[0].totalPlatformEarnings : 0;

  // Mocking trends for now
  return {
    totalCustomers,
    totalCustomersTrend: 12,
    totalDrivers,
    totalDriversTrend: 5,
    activeDrivers: driversOnline,
    todayBookings,
    todayBookingsTrend: -2,
    todayRevenue,
    todayRevenueTrend: 8,
    pendingDocuments: pendingDrivers,
    pendingPayments: pendingPayments,
    completedTrips: completedTrips,
  };
};

const getDashboardCharts = async () => {
  // Returns static mock shapes for phase 1, can be hooked to aggregation pipelines later
  return {
    revenue: [
      { name: 'Jan', total: 12000 }, { name: 'Feb', total: 15000 },
      { name: 'Mar', total: 18000 }, { name: 'Apr', total: 16000 },
      { name: 'May', total: 22000 }, { name: 'Jun', total: 24000 },
      { name: 'Jul', total: 28000 }, { name: 'Aug', total: 25000 },
      { name: 'Sep', total: 29000 }, { name: 'Oct', total: 32000 },
      { name: 'Nov', total: 35000 }, { name: 'Dec', total: 40000 },
    ],
    bookings: [
      { name: 'Jan', count: 120 }, { name: 'Feb', count: 150 },
      { name: 'Mar', count: 180 }, { name: 'Apr', count: 160 },
      { name: 'May', count: 220 }, { name: 'Jun', count: 240 },
      { name: 'Jul', count: 280 }, { name: 'Aug', count: 250 },
      { name: 'Sep', count: 290 }, { name: 'Oct', count: 320 },
      { name: 'Nov', count: 350 }, { name: 'Dec', count: 400 },
    ],
    rideStatus: [
      { name: 'Completed', value: 400, color: '#22c55e' },
      { name: 'Running', value: 80, color: '#3b82f6' },
      { name: 'Pending', value: 50, color: '#eab308' },
      { name: 'Cancelled', value: 20, color: '#ef4444' },
    ],
    driverStatus: [
      { name: 'Available', value: 100, color: '#22c55e' },
      { name: 'Busy', value: 45, color: '#3b82f6' },
      { name: 'Offline', value: 175, color: '#94a3b8' },
    ],
  };
};

const getRecentBookings = async () => {
  const bookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('customer', 'fullName')
    .populate('driver', 'fullName');

  return bookings.map(b => ({
    id: b.bookingId || b._id.toString(),
    customer: b.customer?.fullName || 'Unknown',
    driver: b.driver?.fullName || 'Unassigned',
    vehicle: b.vehicleType,
    trip: `${b.pickupLocation?.address || 'Pickup'} to ${b.dropoffLocation?.address || 'Dropoff'}`,
    status: b.rideStatus,
    fare: b.fareDetails?.totalFare || 0,
  }));
};

const getRecentDrivers = async () => {
  const drivers = await Driver.find()
    .sort({ createdAt: -1 })
    .limit(5);

  return drivers.map(d => ({
    id: d._id.toString(),
    name: d.fullName,
    vehicle: d.vehicle?.model ? `${d.vehicle.brand} ${d.vehicle.model} (${d.vehicle.registrationNumber})` : 'Not added',
    status: d.onlineStatus,
    documents: d.driverStatus,
  }));
};

const getActivities = async () => {
  return [
    { id: '1', title: 'System Online', description: 'Admin panel connected to live backend.', time: 'Just now', type: 'system' }
  ];
};

module.exports = {
  getDashboardOverview,
  getDashboardCharts,
  getRecentBookings,
  getRecentDrivers,
  getActivities
};
