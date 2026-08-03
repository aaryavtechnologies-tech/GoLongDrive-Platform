require('dotenv').config();
const mongoose = require('mongoose');
const Driver = require('./src/models/Driver.model');

async function seedDriver() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'driver@gmail.com';
    const phoneNumber = '9876543210';

    // Check if driver already exists
    let existingDriver = await Driver.findOne({ email });
    if (!existingDriver) {
      existingDriver = await Driver.findOne({ phoneNumber });
    }

    if (existingDriver) {
      console.log('Demo driver already exists. Updating...');
      existingDriver.password = 'driver123';
      existingDriver.fullName = 'Demo Driver';
      existingDriver.email = email;
      existingDriver.phoneNumber = phoneNumber;
      existingDriver.driverStatus = 'approved';
      await existingDriver.save();
      console.log('Demo driver updated successfully.');
    } else {
      console.log('Creating new demo driver...');
      const newDriver = new Driver({

        fullName: 'Demo Driver',
        email: email,
        phoneNumber: phoneNumber,
        password: 'driver123',
        driverStatus: 'approved' // Need to verify if APPROVED is valid, let's omit if unsure or we can just provide it
      });
      await newDriver.save();
      console.log('Demo driver created successfully.');
    }
  } catch (error) {
    console.error('Error seeding driver:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seedDriver();
