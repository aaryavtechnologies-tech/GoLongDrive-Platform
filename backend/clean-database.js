// backend/clean-database.js
require('dotenv').config();
const mongoose = require('mongoose');

// Models to clean
const Booking = require('./src/models/Booking.model.js');
const BookingTimeline = require('./src/models/BookingTimeline.model.js');
const Payment = require('./src/models/Payment.model.js');
const DriverEarning = require('./src/models/DriverEarning.model.js');
const Payout = require('./src/models/Payout.model.js');
const Invoice = require('./src/models/Invoice.model.js');
const Review = require('./src/models/Review.model.js');
const Notification = require('./src/models/Notification.model.js');
const SupportTicket = require('./src/models/SupportTicket.model.js');

// Preserved models (for stat resets)
const Driver = require('./src/models/Driver.model.js');
const Customer = require('./src/models/Customer.model.js');
const Admin = require('./src/models/Admin.model.js');
const TourPackage = require('./src/models/TourPackage.model.js');
const VehicleType = require('./src/models/VehicleType.model.js');

async function cleanDatabase() {
  const isDryRun = process.argv.includes('--dry-run');

  try {
    console.log('----------------------------------------------------');
    console.log(' GoLongDrive Database Cleanup Script');
    console.log(` Mode: ${isDryRun ? 'DRY-RUN (No data will be deleted)' : 'LIVE EXECUTION'}`);
    console.log('----------------------------------------------------');

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in environment or .env file');
    }

    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.\n');

    // 1. Check counts of collections to be deleted
    const counts = {
      bookings: await Booking.countDocuments(),
      bookingTimelines: await BookingTimeline.countDocuments(),
      payments: await Payment.countDocuments(),
      driverEarnings: await DriverEarning.countDocuments(),
      payouts: await Payout.countDocuments(),
      invoices: await Invoice.countDocuments(),
      reviews: await Review.countDocuments(),
      notifications: await Notification.countDocuments(),
      supportTickets: await SupportTicket.countDocuments(),
    };

    console.log('--- Collections to be DELETED ---');
    console.log(`1. Bookings (Rides & Tours):        ${counts.bookings}`);
    console.log(`2. Booking Timelines (Ride logs):   ${counts.bookingTimelines}`);
    console.log(`3. Payments (Transactions):         ${counts.payments}`);
    console.log(`4. Driver Earnings (Ledger):        ${counts.driverEarnings}`);
    console.log(`5. Payouts (Driver withdrawals):    ${counts.payouts}`);
    console.log(`6. Invoices:                        ${counts.invoices}`);
    console.log(`7. Reviews & Ratings:               ${counts.reviews}`);
    console.log(`8. Notifications:                   ${counts.notifications}`);
    console.log(`9. Support Tickets:                 ${counts.supportTickets}`);
    console.log('');

    // 2. Check counts of preserved entities
    const preservedCounts = {
      admins: await Admin.countDocuments(),
      customers: await Customer.countDocuments(),
      drivers: await Driver.countDocuments(),
      tourPackages: await TourPackage.countDocuments(),
      vehicleTypes: await VehicleType.countDocuments(),
    };

    console.log('--- Core Data to be PRESERVED (Untouched) ---');
    console.log(`- Admins:         ${preservedCounts.admins}`);
    console.log(`- Customers:      ${preservedCounts.customers}`);
    console.log(`- Drivers:        ${preservedCounts.drivers}`);
    console.log(`- Tour Packages:  ${preservedCounts.tourPackages}`);
    console.log(`- Vehicle Types:  ${preservedCounts.vehicleTypes}`);
    console.log('----------------------------------------------------\n');

    if (isDryRun) {
      console.log('DRY RUN complete. No changes were made.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Deletions
    console.log('Starting data deletion...');
    const bRes = await Booking.deleteMany({});
    console.log(`✓ Deleted ${bRes.deletedCount} Bookings`);

    const btRes = await BookingTimeline.deleteMany({});
    console.log(`✓ Deleted ${btRes.deletedCount} BookingTimelines`);

    const pRes = await Payment.deleteMany({});
    console.log(`✓ Deleted ${pRes.deletedCount} Payments`);

    const deRes = await DriverEarning.deleteMany({});
    console.log(`✓ Deleted ${deRes.deletedCount} DriverEarnings`);

    const poRes = await Payout.deleteMany({});
    console.log(`✓ Deleted ${poRes.deletedCount} Payouts`);

    const iRes = await Invoice.deleteMany({});
    console.log(`✓ Deleted ${iRes.deletedCount} Invoices`);

    const rRes = await Review.deleteMany({});
    console.log(`✓ Deleted ${rRes.deletedCount} Reviews`);

    const nRes = await Notification.deleteMany({});
    console.log(`✓ Deleted ${nRes.deletedCount} Notifications`);

    const stRes = await SupportTicket.deleteMany({});
    console.log(`✓ Deleted ${stRes.deletedCount} SupportTickets`);

    // Reset Driver wallet balances and availability
    console.log('\nResetting driver wallet balances and ride statuses...');
    const dUpdateRes = await Driver.updateMany(
      {},
      {
        $set: {
          walletBalance: 0,
          availabilityStatus: 'Available',
        },
      }
    );
    console.log(`✓ Reset wallet balance to ₹0 and availability to Available for ${dUpdateRes.modifiedCount} drivers.`);

    console.log('\n====================================================');
    console.log(' DATABASE CLEANUP COMPLETED SUCCESSFULLY');
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n Cleanup failed with error:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

cleanDatabase();

