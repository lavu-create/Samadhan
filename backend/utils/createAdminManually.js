const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createSpecificAdmin = async () => {
  const adminData = {
    name: 'Lavanya',
    email: 'lavanya.admin@gmail.com',
    password: '123456',
    role: 'Admin'
  };

  try {
    // 1. Connect to MongoDB
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully.');

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: adminData.email.toLowerCase() });

    if (existingUser) {
      console.log(`[SKIPPED] User with email ${adminData.email} already exists.`);
      if (existingUser.role === 'Admin') {
        console.log('This user is already an Admin.');
      } else {
        console.log(`This user currently has role: ${existingUser.role}. No changes were made.`);
      }
    } else {
      // 3. Create the new admin
      // Note: User.js model handles password hashing automatically in its 'save' hook
      await User.create(adminData);
      console.log(`[SUCCESS] Admin user created: ${adminData.email}`);
    }

    // 4. Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from database.');
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Failed to create admin:', error.message);
    process.exit(1);
  }
};

// Execute
createSpecificAdmin();
