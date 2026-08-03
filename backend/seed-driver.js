require('dotenv').config();
const mongoose = require('mongoose');
const Driver = require('./src/models/Driver.model');

async function seedDriver() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'driver@gmail.com';
    const phoneNumber = '9876543210';

    // Delete existing driver if it exists
    console.log('Checking for existing demo driver...');
    await Driver.deleteMany({ $or: [{ email }, { phoneNumber }] });
    console.log('Deleted any existing demo drivers.');

    console.log('Creating new demo driver...');
    const newDriver = new Driver({
      fullName: 'Demo Driver',
      email: email,
      phoneNumber: phoneNumber,
      password: 'driver123',
      driverStatus: 'approved',
      userId: new mongoose.Types.ObjectId() // Bypass duplicate userId index
    });
    await newDriver.save();
    console.log('Demo driver created successfully.');
  } catch (error) {
    console.error('Error seeding driver:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seedDriver();
