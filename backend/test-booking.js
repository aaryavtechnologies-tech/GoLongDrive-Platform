require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./src/models/Booking.model');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const booking = await Booking.findOne().sort({ createdAt: -1 }).populate('customer');
  if (!booking) {
    console.log("No booking found");
    process.exit(0);
  }
  console.log("Booking Status:", booking.rideStatus);
  console.log("Customer ridePin:", booking.customer?.ridePin);

  process.exit(0);
}
test();
