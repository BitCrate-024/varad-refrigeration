const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Employee = require('../models/Employee');
const { auth, requireOwner } = require('../middleware/auth');

router.use(auth, requireOwner);

router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.query.employeeId) {
      query.employeeId = req.query.employeeId;
    }
    
    const payments = await Payment.find(query).populate('employeeId', 'name username').sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { employeeId, amountPaid, paymentDate, remarks } = req.body;
    
    if (!employeeId || amountPaid === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (amountPaid <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }
    
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const payment = new Payment({
      employeeId,
      amountPaid,
      paymentDate: paymentDate || new Date(),
      remarks
    });
    
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
