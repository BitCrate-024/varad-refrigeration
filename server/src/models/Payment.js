const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  amountPaid: { type: Number, required: true, min: 0 },
  paymentDate: { type: Date, default: Date.now },
  remarks: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
