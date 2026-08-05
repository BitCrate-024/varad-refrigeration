import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Users, IndianRupee, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.reports.getDashboard();
        setData(res.data);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center p-10">Loading dashboard...</div>;
  if (!data) return null;

  // Charts removed

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Expense" value={`₹${data.todayExpense}`} icon={<IndianRupee className="h-6 w-6 text-green-500" />} color="border-green-500" />
        <StatCard title="This Month" value={`₹${data.monthExpense}`} icon={<TrendingUp className="h-6 w-6 text-blue-500" />} color="border-blue-500" />
        <StatCard title="Total Employees" value={data.totalEmployees} icon={<Users className="h-6 w-6 text-purple-500" />} color="border-purple-500" />
        <StatCard title="Total Entries" value={data.totalEntries} icon={<FileText className="h-6 w-6 text-orange-500" />} color="border-orange-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
        <div className="flex items-center">
          <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Total Outstanding</h3>
            <p className="text-2xl font-bold text-red-600">₹{data.outstandingAmount}</p>
          </div>
        </div>
      </div>


    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${color} flex items-center justify-between`}>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
    <div className="bg-gray-50 p-3 rounded-full">
      {icon}
    </div>
  </div>
);

export default Dashboard;
