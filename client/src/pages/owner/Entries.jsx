import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Search, Filter, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import Modal from '../../components/Modal';

const Entries = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [employees, setEmployees] = useState([]);
  const [shops, setShops] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filters, setFilters] = useState({
    employee: '',
    shop: '',
    company: '',
    startDate: null,
    endDate: null,
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Edit Modal
  const [editEntry, setEditEntry] = useState(null);

  useEffect(() => {
    loadFilterData();
    fetchEntries();
  }, []);

  const loadFilterData = async () => {
    try {
      const [eRes, sRes, cRes] = await Promise.all([
        api.employees.getAll(),
        api.shops.getAll(),
        api.companies.getAll()
      ]);
      setEmployees(eRes.data);
      setShops(sRes.data);
      setCompanies(cRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEntries = async (activeFilters = filters) => {
    setLoading(true);
    try {
      const params = { 
        employeeId: activeFilters.employee,
        shopId: activeFilters.shop,
        companyId: activeFilters.company,
        startDate: activeFilters.startDate,
        endDate: activeFilters.endDate,
        search: activeFilters.search
      };
      if (params.startDate) params.startDate = params.startDate.toISOString();
      if (params.endDate) params.endDate = params.endDate.toISOString();
      const res = await api.entries.getAll(params);
      setEntries(res.data.entries || []);
    } catch (error) {
      toast.error('Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => fetchEntries();
  const clearFilters = () => {
    const cleared = { employee: '', shop: '', company: '', startDate: null, endDate: null, search: '' };
    setFilters(cleared);
    fetchEntries(cleared);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await api.entries.delete(id);
        toast.success('Entry deleted');
        fetchEntries();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.entries.update(editEntry._id, {
        amount: Number(editEntry.amount),
        notes: editEntry.notes
      });
      toast.success('Entry updated');
      setEditEntry(null);
      fetchEntries();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const totalAmount = entries.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-[#1e3a5f]">All Entries</h2>
        <div className="flex space-x-2">
          <span className="font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">Total: ₹{totalAmount.toLocaleString()}</span>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
            <Filter className="w-4 h-4 mr-1" /> Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <select value={filters.employee} onChange={e => handleFilterChange('employee', e.target.value)} className="border rounded p-2">
            <option value="">All Employees</option>
            {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
          <select value={filters.shop} onChange={e => handleFilterChange('shop', e.target.value)} className="border rounded p-2">
            <option value="">All Shops</option>
            {shops.map(s => <option key={s._id} value={s._id}>{s.shopName}</option>)}
          </select>
          <select value={filters.company} onChange={e => handleFilterChange('company', e.target.value)} className="border rounded p-2">
            <option value="">All Companies</option>
            {companies.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
          </select>
          <DatePicker selected={filters.startDate} onChange={d => handleFilterChange('startDate', d)} placeholderText="Start Date" className="border rounded p-2 w-full" />
          <DatePicker selected={filters.endDate} onChange={d => handleFilterChange('endDate', d)} placeholderText="End Date" className="border rounded p-2 w-full" />
          <div className="flex space-x-2">
            <button onClick={applyFilters} className="bg-blue-600 text-white px-3 py-2 rounded flex-1">Apply</button>
            <button onClick={clearFilters} className="bg-gray-200 text-gray-700 px-3 py-2 rounded">Clear</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-700 border-b">
              <th className="p-3">Date</th>
              <th className="p-3">Employee</th>
              <th className="p-3">Shop</th>
              <th className="p-3">Company</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Notes</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center p-4">Loading...</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan="7" className="text-center p-4">No entries found</td></tr>
            ) : (
              entries.map(entry => (
                <tr key={entry._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 whitespace-nowrap">{new Date(entry.date).toLocaleDateString('en-GB')}</td>
                  <td className="p-3">{entry.employeeName}</td>
                  <td className="p-3">{entry.shopName}</td>
                  <td className="p-3">{entry.companyName}</td>
                  <td className="p-3 font-bold">₹{entry.amount}</td>
                  <td className="p-3 text-sm text-gray-600 max-w-xs truncate">{entry.notes}</td>
                  <td className="p-3 flex justify-center space-x-2">
                    <button onClick={() => setEditEntry(entry)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(entry._id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!editEntry} onClose={() => setEditEntry(null)} title="Edit Entry">
        {editEntry && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Amount (₹)</label>
              <input type="number" value={editEntry.amount} onChange={e => setEditEntry({...editEntry, amount: e.target.value})} className="w-full border rounded p-2" required />
            </div>
            <div>
              <label className="block text-sm mb-1">Notes</label>
              <textarea value={editEntry.notes || ''} onChange={e => setEditEntry({...editEntry, notes: e.target.value})} className="w-full border rounded p-2" rows="3" />
            </div>
            <button type="submit" className="w-full bg-[#1e3a5f] text-white py-2 rounded">Update</button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Entries;
