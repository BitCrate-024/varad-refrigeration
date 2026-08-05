import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EmployeeReport = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.employees.getAll().then(res => setEmployees(res.data)).catch(() => toast.error('Error loading employees'));
  }, []);

  useEffect(() => {
    if (selectedEmp) {
      setLoading(true);
      api.reports.getEmployeeReport(selectedEmp)
        .then(res => setReport(res.data))
        .catch(() => toast.error('Error loading report'))
        .finally(() => setLoading(false));
    } else {
      setReport(null);
    }
  }, [selectedEmp]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-[#1e3a5f] mb-4">Employee Report</h2>
        <select value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)} className="w-full md:w-1/3 border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none">
          <option value="">-- Select an Employee --</option>
          {employees.map(e => (
            <option key={e._id} value={e._id}>{e.name}</option>
          ))}
        </select>
      </div>

      {loading && <div className="text-center p-4">Loading report...</div>}

      {report && !loading && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Bills" value={report.totalBills} />
            <StatCard label="Total Expense" value={`₹${report.totalExpense}`} color="text-red-600" />
            <StatCard label="Total Paid" value={`₹${report.totalPaid}`} color="text-green-600" />
            <StatCard label="Outstanding" value={`₹${report.outstanding}`} color="text-orange-600" />
            <StatCard label="Avg Bill" value={`₹${report.averageExpense}`} />
            <StatCard label="Highest Bill" value={`₹${report.highestExpense}`} />
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <h3 className="bg-gray-50 px-6 py-3 font-bold border-b text-gray-700">Recent Entries</h3>
            <ul className="divide-y">
              {report.entries.length === 0 ? (
                <li className="p-6 text-center text-gray-500">No entries found.</li>
              ) : (
                report.entries.map(entry => (
                  <li key={entry._id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <p className="font-medium">{entry.shopName} • {entry.companyName}</p>
                      <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString('en-GB')}</p>
                    </div>
                    <div className="font-bold text-lg">₹{entry.amount}</div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color = "text-gray-800" }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm text-center">
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`text-xl font-bold ${color}`}>{value}</p>
  </div>
);

export default EmployeeReport;
