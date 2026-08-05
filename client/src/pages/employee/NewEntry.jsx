import React, { useState, useEffect, useContext } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import api from '../../services/api';
import DropdownWithAdd from '../../components/DropdownWithAdd';
import Modal from '../../components/Modal';
import { AuthContext } from '../../context/AuthContext';

const NewEntry = () => {
  const { user } = useContext(AuthContext);
  const [date, setDate] = useState(new Date());
  const [employeeId, setEmployeeId] = useState('');
  const [shopId, setShopId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const [employees, setEmployees] = useState([]);
  const [shops, setShops] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [modalType, setModalType] = useState(null); // 'shop' or 'company'
  const [newItemName, setNewItemName] = useState('');

  const loadData = async () => {
    try {
      const [empRes, shopRes, compRes] = await Promise.all([
        api.employees.getAll(),
        api.shops.getAll(),
        api.companies.getAll()
      ]);
      setEmployees(empRes.data.filter(e => e.active));
      setShops(shopRes.data.filter(s => s.active));
      setCompanies(compRes.data.filter(c => c.active));
      
      // Auto-select current employee if possible
      if (user && user.role === 'employee') {
        const myEmp = empRes.data.find(e => e.username === user.username);
        if (myEmp) setEmployeeId(myEmp._id);
      }
    } catch (err) {
      toast.error('Failed to load form data');
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId || !shopId || !companyId || !amount || amount <= 0) {
      toast.error("Please fill all required fields correctly.");
      return;
    }

    try {
      await api.entries.create({
        date,
        employeeId: employeeId,
        shopId: shopId,
        companyId: companyId,
        amount: Number(amount),
        notes
      });
      toast.success('Entry added successfully!');
      setShopId('');
      setCompanyId('');
      setAmount('');
      setNotes('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding entry');
    }
  };

  const handleAddNew = async () => {
    if (!newItemName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      if (modalType === 'shop') {
        const res = await api.shops.create({ shopName: newItemName });
        setShops([...shops, res.data]);
        setShopId(res.data._id);
      } else if (modalType === 'company') {
        const res = await api.companies.create({ companyName: newItemName });
        setCompanies([...companies, res.data]);
        setCompanyId(res.data._id);
      }
      toast.success('Added successfully!');
      setModalType(null);
      setNewItemName('');
    } catch (err) {
      toast.error('Failed to add new item');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6 mt-4">
      <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6 border-b pb-2">New Material Entry</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Date</label>
          <DatePicker 
            selected={date} 
            onChange={(d) => setDate(d)} 
            dateFormat="dd/MM/yyyy"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <DropdownWithAdd 
          label="Employee Name"
          options={employees}
          value={employeeId}
          onChange={setEmployeeId}
          onAdd={() => toast.error("Employees can only be added by Owner")}
          placeholder="Select Employee"
        />

        <DropdownWithAdd 
          label="Shop Name"
          options={shops}
          value={shopId}
          onChange={setShopId}
          onAdd={() => setModalType('shop')}
          placeholder="Select Shop"
        />

        <DropdownWithAdd 
          label="Company Name"
          options={companies}
          value={companyId}
          onChange={setCompanyId}
          onAdd={() => setModalType('company')}
          placeholder="Select Company"
        />

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Bill Amount (₹)</label>
          <input 
            type="number"
            min="1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Notes (Optional)</label>
          <textarea 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            rows="3"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any details..."
          ></textarea>
        </div>

        <button type="submit" className="w-full bg-[#1e3a5f] hover:bg-[#2d5a8e] text-white font-semibold py-3 rounded-lg transition mt-4">
          Submit Entry
        </button>
      </form>

      <Modal isOpen={!!modalType} onClose={() => setModalType(null)} title={`Add New ${modalType === 'shop' ? 'Shop' : 'Company'}`}>
        <div className="flex flex-col space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              autoFocus
            />
          </div>
          <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default NewEntry;
