import React from 'react';

const DropdownWithAdd = ({ label, options = [], value, onChange, onAdd, placeholder = 'Select...' }) => {
  const handleChange = (e) => {
    if (e.target.value === 'ADD_NEW') {
      onAdd();
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <div className="flex flex-col mb-4">
      <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>
      <select 
        value={value || ''} 
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition bg-white"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(opt => (
          <option key={opt._id} value={opt._id}>{opt.name || opt.shopName || opt.companyName}</option>
        ))}
        <option value="ADD_NEW" className="font-bold text-blue-600">➕ Add New {label}...</option>
      </select>
    </div>
  );
};

export default DropdownWithAdd;
