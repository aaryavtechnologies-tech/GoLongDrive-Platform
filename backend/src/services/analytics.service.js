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
    approvedDrivers,
    pendingDrivers,
    driversOnline,
    driversBusy,
    totalCoupons,
    activeCoupons
  ] = await Promise.all([
    Customer.countDocuments(),
    Driver.countDocuments(),
    Driver.countDocuments({ driverStatus: DRIVER_STATUS.APPROVED }),
    Driver.countDocuments({ driverStatus: DRIVER_STATUS.PENDING }),
    Driver.countDocuments({ onlineStatus: ONLINE_STATUS.ONLINE }),
    Driver.countDocuments({ availabilityStatus: AVAILABILITY_STATUS.BUSY }),
    Coupon.countDocuments(),
    Coupon.countDocuments({ isActive: true })
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    todayBookings,
    activeTrips,
    completedTrips,
    cancelledTrips
  ] = await Promise.all([
    Booking.countDocuments({ createdAt: { $gte: today } }),
    Booking.countDocuments({ rideStatus: { $in: [RIDE_STATUS.DRIVER_ASSIGNED, RIDE_STATUS.DRIVER_ACCEPTED, RIDE_STATUS.CONFIRMED, RIDE_STATUS.DRIVER_ARRIVING, RIDE_STATUS.TRIP_STARTED] } }),
    Booking.countDocuments({ rideStatus: RIDE_STATUS.TRIP_COMPLETED }),
    Booking.countDocuments({ rideStatus: { $regex: 'Cancelled', $options: 'i' } })
  ]);

  const [revenueStats, paymentStats] = await Promise.all([
    DriverEarning.aggregate([
      { 
        $group: { 
          _id: null, 
          totalPlatformEarnings: { $sum: '$platformFee' },
          totalDriverEarnings: { $sum: '$driverEarnings' }
        } 
      }
    ]),
    Payment.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ])
  ]);

  const platformEarnings = revenueStats[0] ? revenueStats[0].totalPlatformEarnings : 0;
  
  let pendingPayments = 0, completedPayments = 0, refundedPayments = 0;
  paymentStats.forEach(stat => {
    if (stat._id === PAYMENT_STATUS.PENDING) pendingPayments = stat.count;
    if (stat._id === PAYMENT_STATUS.PAID || stat._id === PAYMENT_STATUS.ADVANCE_PAID) completedPayments += stat.count;
    if (stat._id === PAYMENT_STATUS.REFUNDED) refundedPayments = stat.count;
  });

  return {
    users: { totalCustomers, totalDrivers, approvedDrivers, pendingDrivers, driversOnline, driversBusy },
    bookings: { todayBookings, activeTrips, completedTrips, cancelledTrips },
    revenue: { platformEarnings },
    payments: { pendingPayments, completedPayments, refundedPayments },
    coupons: { totalCoupons, activeCoupons }
  };
};

module.exports = {
  getDashboardOverview
};
