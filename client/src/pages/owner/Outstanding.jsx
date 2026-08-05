import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';

const Outstanding = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Payment Modal
  const [paymentModal, setPaymentModal] = useState(null); // stores employee id
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');

  const fetchOutstanding = async () => {
    try {
      const res = await api.reports.getOutstanding();
      setData(res.data);
    } catch (error) {
      toast.error('Failed to load outstanding data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutstanding();
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return toast.error('Enter a valid amount');
    
    try {
      await api.payments.create({ employeeId: paymentModal, amountPaid: Number(amount), remarks });
      toast.success('Payment recorded');
      setPaymentModal(null);
      setAmount('');
      setRemarks('');
      fetchOutstanding();
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
        <h2 className="text-xl font-bold text-gray-800">Total Outstanding</h2>
        <p className="text-3xl font-bold text-red-600 mt-2">₹{data?.reduce((acc, emp) => acc + emp.balance, 0)}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Employee Name</th>
              <th className="p-4 text-right">Total Bills</th>
              <th className="p-4 text-right">Total Paid</th>
              <th className="p-4 text-right font-bold text-red-600">Balance</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.map(emp => (
              <tr key={emp.employee._id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{emp.employee.name}</td>
                <td className="p-4 text-right">₹{emp.totalExpense}</td>
                <td className="p-4 text-right text-green-600">₹{emp.totalPaid}</td>
                <td className="p-4 text-right font-bold text-red-600">₹{emp.balance}</td>
                <td className="p-4 text-center">
                  {emp.balance > 0 ? (
                    <button onClick={() => setPaymentModal(emp.employee._id)} className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">
                      Record Payment
                    </button>
                  ) : (
                    <span className="text-gray-400">Settled</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!paymentModal} onClose={() => setPaymentModal(null)} title="Record Payment">
        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Amount Paid (₹)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Remarks</label>
            <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full border rounded p-2" />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Submit Payment</button>
        </form>
      </Modal>
    </div>
  );
};

export default Outstanding;
