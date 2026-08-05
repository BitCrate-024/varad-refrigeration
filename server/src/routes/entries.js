const express = require('express');
const router = express.Router();
const MaterialEntry = require('../models/MaterialEntry');
const Employee = require('../models/Employee');
const Shop = require('../models/Shop');
const Company = require('../models/Company');
const { auth, requireOwner } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'employee') {
      query.employeeId = req.user.id;
    } else {
      const { employeeId, companyId, shopId, startDate, endDate, minAmount, maxAmount, search } = req.query;
      
      if (employeeId) query.employeeId = employeeId;
      if (companyId) query.companyId = companyId;
      if (shopId) query.shopId = shopId;
      
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }
      
      if (minAmount || maxAmount) {
        query.amount = {};
        if (minAmount) query.amount.$gte = Number(minAmount);
        if (maxAmount) query.amount.$lte = Number(maxAmount);
      }
      
      if (search) {
        query.$or = [
          { employeeName: { $regex: search, $options: 'i' } },
          { shopName: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } }
        ];
      }
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    const entries = await MaterialEntry.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);
      
    const total = await MaterialEntry.countDocuments(query);
    
    res.json({
      entries,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { employeeId, date, shopId, companyId, amount, notes } = req.body;
    
    if (!employeeId || !date || !shopId || !companyId || amount === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }
    
    const employee = await Employee.findById(employeeId);
    const shop = await Shop.findById(shopId);
    const company = await Company.findById(companyId);
    
    if (!employee || !shop || !company) {
      return res.status(400).json({ message: 'Invalid employee, shop, or company ID' });
    }
    
    const entry = new MaterialEntry({
      employeeId,
      employeeName: employee.name,
      date,
      shopId,
      shopName: shop.shopName,
      companyId,
      companyName: company.companyName,
      amount,
      notes
    });
    
    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, requireOwner, async (req, res) => {
  try {
    const entry = await MaterialEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    
    const { amount, notes, date, shopId, companyId, employeeId } = req.body;
    
    if (amount !== undefined) entry.amount = amount;
    if (notes !== undefined) entry.notes = notes;
    if (date) entry.date = date;
    
    if (employeeId) {
      const employee = await Employee.findById(employeeId);
      if (employee) {
        entry.employeeId = employeeId;
        entry.employeeName = employee.name;
      }
    }
    if (shopId) {
      const shop = await Shop.findById(shopId);
      if (shop) {
        entry.shopId = shopId;
        entry.shopName = shop.shopName;
      }
    }
    if (companyId) {
      const company = await Company.findById(companyId);
      if (company) {
        entry.companyId = companyId;
        entry.companyName = company.companyName;
      }
    }
    
    await entry.save();
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, requireOwner, async (req, res) => {
  try {
    const entry = await MaterialEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    
    await entry.deleteOne();
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
