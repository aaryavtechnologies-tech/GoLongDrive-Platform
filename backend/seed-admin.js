require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin.model');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@golongdrive.com' });
    if (existingAdmin) {
      console.log('Admin already exists. Updating password...');
      existingAdmin.password = 'admin123';
      await existingAdmin.save();
      console.log('Admin updated successfully.');
    } else {
      console.log('Creating new admin...');
      const newAdmin = new Admin({
        name: 'Super Admin',
        email: 'admin@golongdrive.com',
        password: 'admin123'
      });
      await newAdmin.save();
      console.log('Admin created successfully.');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seedAdmin();
