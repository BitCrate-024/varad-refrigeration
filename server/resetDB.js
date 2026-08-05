require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./src/models/Employee');
const Shop = require('./src/models/Shop');
const Company = require('./src/models/Company');
const MaterialEntry = require('./src/models/MaterialEntry');
const Payment = require('./src/models/Payment');
const connectDB = require('./src/config/db');

const resetDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB...');

    // Delete everything EXCEPT the owner account
    console.log('Clearing old entries, shops, and companies...');
    await MaterialEntry.deleteMany({});
    await Payment.deleteMany({});
    await Shop.deleteMany({});
    await Company.deleteMany({});
    
    // Delete all employees except the owner
    await Employee.deleteMany({ role: { $ne: 'owner' } });

    console.log('✅ Database reset complete. All test data removed.');
    console.log('Your Owner account remains active for login.');
    process.exit();
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
};

resetDatabase();
