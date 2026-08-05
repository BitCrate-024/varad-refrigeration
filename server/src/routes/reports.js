const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const MaterialEntry = require('../models/MaterialEntry');
const Payment = require('../models/Payment');
const { auth, requireOwner } = require('../middleware/auth');

router.use(auth, requireOwner);

router.get('/dashboard', async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ active: true, role: 'employee' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayEntries = await MaterialEntry.aggregate([
      { $match: { date: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const todayExpense = todayEntries.length > 0 ? todayEntries[0].total : 0;
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEntries = await MaterialEntry.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthExpense = monthEntries.length > 0 ? monthEntries[0].total : 0;
    
    const totalEntriesCount = await MaterialEntry.countDocuments();
    
    const totalExpenseAgg = await MaterialEntry.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpenseAll = totalExpenseAgg.length > 0 ? totalExpenseAgg[0].total : 0;
    
    const totalPaymentsAgg = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    const totalPayments = totalPaymentsAgg.length > 0 ? totalPaymentsAgg[0].total : 0;
    
    const outstandingAmount = totalExpenseAll - totalPayments;
    
    res.json({
      totalEmployees,
      todayExpense,
      monthExpense,
      totalEntries: totalEntriesCount,
      outstandingAmount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/employee/:id', async (req, res) => {
  try {
    const employeeId = new mongoose.Types.ObjectId(req.params.id);
    
    const entriesAgg = await MaterialEntry.aggregate([
      { $match: { employeeId } },
      { $group: { 
          _id: null, 
          totalExpense: { $sum: '$amount' }, 
          totalBills: { $sum: 1 },
          highestExpense: { $max: '$amount' },
          lowestExpense: { $min: '$amount' },
          averageExpense: { $avg: '$amount' }
      }}
    ]);
    
    const stats = entriesAgg.length > 0 ? entriesAgg[0] : { totalExpense: 0, totalBills: 0, highestExpense: 0, lowestExpense: 0, averageExpense: 0 };
    
    const paymentsAgg = await Payment.aggregate([
      { $match: { employeeId } },
      { $group: { _id: null, totalPaid: { $sum: '$amountPaid' } } }
    ]);
    
    const totalPaid = paymentsAgg.length > 0 ? paymentsAgg[0].totalPaid : 0;
    const outstanding = (stats.totalExpense || 0) - totalPaid;
    
    const entries = await MaterialEntry.find({ employeeId }).sort({ date: -1 }).limit(10);
    
    res.json({
      totalBills: stats.totalBills,
      totalExpense: stats.totalExpense,
      totalPaid,
      outstanding,
      averageExpense: stats.averageExpense,
      highestExpense: stats.highestExpense,
      lowestExpense: stats.lowestExpense,
      entries
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/monthly', async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    
    const matchStage = { date: { $gte: startDate, $lt: endDate } };
    
    const basicAgg = await MaterialEntry.aggregate([
      { $match: matchStage },
      { $group: { _id: null, totalExpense: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    const totalExpense = basicAgg.length > 0 ? basicAgg[0].totalExpense : 0;
    const totalPurchases = basicAgg.length > 0 ? basicAgg[0].count : 0;
    
    const employeeWise = await MaterialEntry.aggregate([
      { $match: matchStage },
      { $group: { _id: '$employeeName', sum: { $sum: '$amount' } } },
      { $sort: { sum: -1 } }
    ]);
    
    const companyWise = await MaterialEntry.aggregate([
      { $match: matchStage },
      { $group: { _id: '$companyName', sum: { $sum: '$amount' } } },
      { $sort: { sum: -1 } }
    ]);
    
    const shopWise = await MaterialEntry.aggregate([
      { $match: matchStage },
      { $group: { _id: '$shopName', sum: { $sum: '$amount' } } },
      { $sort: { sum: -1 } }
    ]);
    
    const dailySpending = await MaterialEntry.aggregate([
      { $match: matchStage },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, sum: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      totalExpense,
      totalPurchases,
      employeeWise,
      companyWise,
      shopWise,
      dailySpending
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/outstanding', async (req, res) => {
  try {
    const activeEmployees = await Employee.find({ active: true, role: 'employee' });
    const results = [];
    
    for (const emp of activeEmployees) {
      const expenses = await MaterialEntry.aggregate([
        { $match: { employeeId: emp._id } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]);
      const totalBills = expenses.length > 0 ? expenses[0].count : 0;
      const totalExpense = expenses.length > 0 ? expenses[0].total : 0;
      
      const payments = await Payment.aggregate([
        { $match: { employeeId: emp._id } },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } }
      ]);
      const totalPaid = payments.length > 0 ? payments[0].total : 0;
      
      results.push({
        employee: emp,
        totalBills,
        totalExpense,
        totalPaid,
        balance: totalExpense - totalPaid
      });
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
