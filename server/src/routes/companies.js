const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const { auth, requireOwner } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'owner' ? {} : { active: true };
    const companies = await Company.find(query);
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { companyName } = req.body;
    let existing = await Company.findOne({ companyName: { $regex: new RegExp('^' + companyName + '$', 'i') } });
    if (existing) {
      return res.status(400).json({ message: 'Company name already exists' });
    }
    
    const company = new Company({ companyName });
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, requireOwner, async (req, res) => {
  try {
    const { companyName, active } = req.body;
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    
    if (companyName) {
      let existing = await Company.findOne({ companyName: { $regex: new RegExp('^' + companyName + '$', 'i') }, _id: { $ne: company._id } });
      if (existing) return res.status(400).json({ message: 'Company name already exists' });
      company.companyName = companyName;
    }
    if (active !== undefined) company.active = active;
    
    await company.save();
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, requireOwner, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    
    company.active = false;
    await company.save();
    res.json({ message: 'Company deactivated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
