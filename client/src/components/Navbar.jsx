import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, Snowflake } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = user?.role === 'owner' ? [
    { name: 'Dashboard', path: '/owner/dashboard' },
    { name: 'Entries', path: '/owner/entries' },
    { name: 'Employee Report', path: '/owner/employee-report' },
    { name: 'Monthly Report', path: '/owner/monthly-report' },
    { name: 'Outstanding', path: '/owner/outstanding' },
    { name: 'Master Data', path: '/owner/master-data' },
  ] : [
    { name: 'New Entry', path: '/employee/new-entry' },
    { name: 'My Entries', path: '/employee/my-entries' },
  ];

  return (
    <nav className="bg-[#1e3a5f] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Snowflake className="h-8 w-8 text-[#60a5fa] mr-2" />
            <span className="font-bold text-xl tracking-wider">VARAD REFRIGERATION</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className="px-3 py-2 rounded hover:bg-[#2d5a8e] transition">
                {link.name}
              </Link>
            ))}
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded ml-4 transition">
              Logout
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-gray-300">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#2d5a8e] px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded hover:bg-[#1e3a5f]">
              {link.name}
            </Link>
          ))}
          <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-300 hover:bg-[#1e3a5f] rounded">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
