require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const activeStatuses = [
  'Pending',
  'Searching Driver',
  'Driver Assigned',
  'Driver Accepted',
  'Confirmed',
  'Driver Arriving',
  'Trip Started'
];

async function deleteActiveRides() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');
    
    // We only need the mongoose model to run deleteMany on the collection,
    // or we can just access the collection directly.
    const db = mongoose.connection.db;
    const result = await db.collection('bookings').deleteMany({
      rideStatus: { $in: activeStatuses }
    });
    
    console.log(`Deleted ${result.deletedCount} active rides.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

deleteActiveRides();
