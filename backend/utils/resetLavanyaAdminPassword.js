const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const resetLavanyaPassword = async () => {
  const targetEmail = 'lavanya.admin@gmail.com';
  const newPassword = '123456';

  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // Find the user
    const user = await User.findOne({ email: targetEmail.toLowerCase() });

    if (!user) {
      console.log(`[FAILED] User with email ${targetEmail} not found.`);
    } else {
      console.log(`Found user: ${user.name} (${user.role})`);
      
      // Update password and ensure role is Admin
      user.password = newPassword;
      user.role = 'Admin';
      
      // Save the user - this triggers the bcrypt pre-save hook in models/User.js
      await user.save();
      console.log(`[SUCCESS] Password for ${targetEmail} has been reset to: ${newPassword}`);
      console.log(`Role confirmed as: ${user.role}`);
    }

    await mongoose.disconnect();
    console.log('Disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Reset failed:', error.message);
    process.exit(1);
  }
};

resetLavanyaPassword();
