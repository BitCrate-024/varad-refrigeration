require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Employee = require('./src/models/Employee');
const Shop = require('./src/models/Shop');
const Company = require('./src/models/Company');
const MaterialEntry = require('./src/models/MaterialEntry');
const Payment = require('./src/models/Payment');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB for seeding...');

    await Employee.deleteMany();
    await Shop.deleteMany();
    await Company.deleteMany();
    await MaterialEntry.deleteMany();
    await Payment.deleteMany();
    console.log('Cleared existing data.');

    const owner = new Employee({
      name: 'Owner',
      username: 'owner',
      password: 'owner123',
      role: 'owner'
    });
    await owner.save();

    const employees = [
      { name: 'Rahul', username: 'rahul', password: 'password123', role: 'employee' },
      { name: 'Amit', username: 'amit', password: 'password123', role: 'employee' },
      { name: 'Sagar', username: 'sagar', password: 'password123', role: 'employee' },
      { name: 'Varad', username: 'varad', password: 'password123', role: 'employee' }
    ];
    await Employee.insertMany(employees);

    const shops = [
      { shopName: 'ABC Refrigeration' },
      { shopName: 'Cool Point' },
      { shopName: 'Ice World' },
      { shopName: 'Metro Electricals' }
    ];
    await Shop.insertMany(shops);

    const companies = [
      { companyName: 'Reliance' },
      { companyName: 'Jio' },
      { companyName: 'Tata' },
      { companyName: 'D-Mart' },
      { companyName: 'L&T' }
    ];
    await Company.insertMany(companies);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Seed Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
