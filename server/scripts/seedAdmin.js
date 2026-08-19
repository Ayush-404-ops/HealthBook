require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@healthbook.com' });
    if (existing) {
      console.log('ℹ️  Admin already exists:', existing.email);
      process.exit(0);
    }

    await User.create({
      name: 'HealthBook Admin',
      email: 'admin@healthbook.com',
      password: 'Admin@1234',
      role: 'admin',
    });

    console.log('✅ Admin seeded successfully!');
    console.log('   Email:    admin@healthbook.com');
    console.log('   Password: Admin@1234');
    console.log('   ⚠️  Change the password after first login!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seedAdmin();
