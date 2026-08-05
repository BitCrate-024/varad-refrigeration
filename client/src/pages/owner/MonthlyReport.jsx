import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Bar, Pie } from 'react-chartjs-2';

const MonthlyReport = () => {
  const date = new Date();
  const [month, setMonth] = useState(date.getMonth() + 1);
  const [year, setYear] = useState(date.getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.reports.getMonthlyReport(month, year);
      setReport(res.data);
    } catch (error) {
      toast.error('Failed to load monthly report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-xl font-bold text-[#1e3a5f]">Monthly Report</h2>
        <div className="flex space-x-2">
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="border rounded-lg p-2">
            {Array.from({length: 12}, (_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', {month: 'long'})}</option>
            ))}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="border rounded-lg p-2">
            {[year-1, year, year+1].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-4">Loading...</div>
      ) : report ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm text-center">
              <p className="text-gray-500">Total Expense</p>
              <p className="text-2xl font-bold text-red-600">₹{report.totalExpense}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm text-center">
              <p className="text-gray-500">Total Entries</p>
              <p className="text-2xl font-bold">{report.totalPurchases}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold mb-4">Employee Breakdown</h3>
              <div className="h-64 flex justify-center">
                <Pie data={{
                  labels: report.employeeWise.map(e => e._id),
                  datasets: [{
                    data: report.employeeWise.map(e => e.sum),
                    backgroundColor: ['#1e3a5f', '#3b82f6', '#93c5fd', '#bfdbfe', '#2563eb', '#1d4ed8', '#1e40af']
                  }]
                }} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold mb-4">Daily Trend</h3>
              <div className="h-64">
                <Bar data={{
                  labels: report.dailySpending.map(d => d._id),
                  datasets: [{ label: 'Expense', data: report.dailySpending.map(d => d.sum), backgroundColor: '#60a5fa' }]
                }} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default MonthlyReport;
