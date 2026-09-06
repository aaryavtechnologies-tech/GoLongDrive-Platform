require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const Booking = require('./src/models/Booking.model.js');
const BookingTimeline = require('./src/models/BookingTimeline.model.js');
const Invoice = require('./src/models/Invoice.model.js');
const Payment = require('./src/models/Payment.model.js');
const DriverEarning = require('./src/models/DriverEarning.model.js');
const Review = require('./src/models/Review.model.js');

async function clearBookings() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    console.log('Clearing bookings data...');
    const bRes = await Booking.deleteMany({});
    console.log(`Deleted ${bRes.deletedCount} Bookings`);

    const btRes = await BookingTimeline.deleteMany({});
    console.log(`Deleted ${btRes.deletedCount} BookingTimelines`);

    const iRes = await Invoice.deleteMany({});
    console.log(`Deleted ${iRes.deletedCount} Invoices`);

    const pRes = await Payment.deleteMany({});
    console.log(`Deleted ${pRes.deletedCount} Payments`);

    const dRes = await DriverEarning.deleteMany({});
    console.log(`Deleted ${dRes.deletedCount} DriverEarnings`);

    const rRes = await Review.deleteMany({});
    console.log(`Deleted ${rRes.deletedCount} Reviews`);

    console.log('Done clearing bookings data.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

clearBookings();
