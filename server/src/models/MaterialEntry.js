const mongoose = require('mongoose');

const materialEntrySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeName: { type: String, required: true },
  date: { type: Date, required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  shopName: { type: String, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  companyName: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

materialEntrySchema.index({ employeeId: 1, date: 1, companyId: 1, shopId: 1 });

module.exports = mongoose.model('MaterialEntry', materialEntrySchema);
