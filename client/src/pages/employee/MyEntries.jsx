import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';

const MyEntries = () => {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const empRes = await api.employees.getAll();
        const myEmp = empRes.data.find(e => e.username === user.username);
        if (myEmp) {
          const res = await api.entries.getAll({ employeeId: myEmp._id });
          setEntries(res.data.entries);
          setTotal(res.data.entries.reduce((acc, curr) => acc + curr.amount, 0));
        }
      } catch (error) {
        toast.error("Failed to load entries");
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-4 space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-center border-l-4 border-[#1e3a5f]">
        <h2 className="text-2xl font-bold text-gray-800">My Entries</h2>
        <div className="mt-2 md:mt-0 text-xl text-gray-600">
          Total Spent: <span className="font-bold text-red-600">₹{total.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {entries.length === 0 ? (
          <div className="bg-white p-8 text-center text-gray-500 rounded-xl shadow-sm">No entries found.</div>
        ) : (
          entries.map(entry => (
            <div key={entry._id} className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm text-gray-500 font-medium">{new Date(entry.date).toLocaleDateString('en-GB')}</div>
                <div className="text-lg font-bold text-gray-800">₹{entry.amount.toLocaleString()}</div>
              </div>
              <div className="text-gray-700">
                <span className="font-medium">{entry.shopName}</span> • <span className="text-gray-500">{entry.companyName}</span>
              </div>
              {entry.notes && <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">{entry.notes}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyEntries;
