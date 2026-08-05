const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { auth, requireOwner } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

router.get('/', auth, async (req, res) => {
  try {
    const query = {};
    if (req.user.role !== 'owner') {
      query.active = true;
    } else if (req.query.active === 'true') {
      query.active = true;
    }
    
    const employees = await Employee.find(query).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, requireOwner, async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    
    let existing = await Employee.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    const employee = new Employee({ name, username, password, role });
    await employee.save();
    
    const empData = employee.toObject();
    delete empData.password;
    res.status(201).json(empData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, requireOwner, async (req, res) => {
  try {
    const { name, username, active, password } = req.body;
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    
    if (name) employee.name = name;
    if (username) {
      const existing = await Employee.findOne({ username: username.toLowerCase(), _id: { $ne: employee._id } });
      if (existing) return res.status(400).json({ message: 'Username already exists' });
      employee.username = username;
    }
    if (active !== undefined) employee.active = active;
    if (password) employee.password = password;
    
    await employee.save();
    const empData = employee.toObject();
    delete empData.password;
    res.json(empData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, requireOwner, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    
    employee.active = false;
    await employee.save();
    res.json({ message: 'Employee deactivated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
