import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Pencil, Power } from 'lucide-react';
import Modal from '../../components/Modal';

const MasterData = () => {
  const [activeTab, setActiveTab] = useState('employees');
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'employee' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'employees') res = await api.employees.getAll();
      else if (activeTab === 'shops') res = await api.shops.getAll();
      else res = await api.companies.getAll();
      setData(res.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    setEditItem(item);
    if (item) {
      setFormData({ name: item.name || item.shopName || item.companyName, username: item.username || '', password: '', role: item.role || 'employee' });
    } else {
      setFormData({ name: '', username: '', password: '', role: 'employee' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (activeTab !== 'employees') {
        if (activeTab === 'shops') {
          payload.shopName = payload.name;
        } else {
          payload.companyName = payload.name;
        }
        delete payload.name;
        delete payload.username;
        delete payload.password;
        delete payload.role;
      } else if (!payload.password && editItem) {
        delete payload.password;
      }

      if (editItem) {
        if (activeTab === 'employees') await api.employees.update(editItem._id, payload);
        else if (activeTab === 'shops') await api.shops.update(editItem._id, payload);
        else await api.companies.update(editItem._id, payload);
        toast.success('Updated successfully');
      } else {
        if (activeTab === 'employees') await api.employees.create(payload);
        else if (activeTab === 'shops') await api.shops.create(payload);
        else await api.companies.create(payload);
        toast.success('Created successfully');
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const toggleStatus = async (item) => {
    try {
      const payload = { active: !item.active };
      if (activeTab === 'employees') await api.employees.update(item._id, payload);
      else if (activeTab === 'shops') await api.shops.update(item._id, payload);
      else await api.companies.update(item._id, payload);
      toast.success(`Status changed to ${payload.active ? 'Active' : 'Inactive'}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to change status');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden min-h-[500px]">
      <div className="flex border-b bg-gray-50">
        {['employees', 'shops', 'companies'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 font-semibold capitalize ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold capitalize">{activeTab} List</h2>
          <button onClick={() => openModal()} className="bg-[#1e3a5f] text-white px-4 py-2 rounded">
            + Add New
          </button>
        </div>

        {loading ? <div className="text-center p-4">Loading...</div> : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3">Name</th>
                {activeTab === 'employees' && <th className="p-3">Username</th>}
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{item.name || item.shopName || item.companyName}</td>
                  {activeTab === 'employees' && <td className="p-3">{item.username}</td>}
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3 flex justify-center space-x-2">
                    <button onClick={() => openModal(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Pencil className="w-4 h-4"/></button>
                    <button onClick={() => toggleStatus(item)} className={`p-1 rounded ${item.active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`} title="Toggle Status"><Power className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`${editItem ? 'Edit' : 'Add'} ${activeTab.slice(0, -1)}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded p-2" required />
          </div>
          {activeTab === 'employees' && (
            <>
              <div>
                <label className="block text-sm mb-1">Username</label>
                <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full border rounded p-2" required />
              </div>
              <div>
                <label className="block text-sm mb-1">{editItem ? 'Password (leave blank to keep current)' : 'Password'}</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border rounded p-2" required={!editItem} />
              </div>
            </>
          )}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Save</button>
        </form>
      </Modal>
    </div>
  );
};

export default MasterData;
