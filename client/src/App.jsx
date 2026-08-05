import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import NewEntry from './pages/employee/NewEntry';
import MyEntries from './pages/employee/MyEntries';
import Dashboard from './pages/owner/Dashboard';
import Entries from './pages/owner/Entries';
import EmployeeReport from './pages/owner/EmployeeReport';
import MonthlyReport from './pages/owner/MonthlyReport';
import Outstanding from './pages/owner/Outstanding';
import MasterData from './pages/owner/MasterData';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Employee Routes */}
        <Route element={<ProtectedRoute role="employee" />}>
          <Route path="/employee/new-entry" element={<NewEntry />} />
          <Route path="/employee/my-entries" element={<MyEntries />} />
        </Route>

        {/* Owner Routes */}
        <Route element={<ProtectedRoute role="owner" />}>
          <Route path="/owner/dashboard" element={<Dashboard />} />
          <Route path="/owner/entries" element={<Entries />} />
          <Route path="/owner/employee-report" element={<EmployeeReport />} />
          <Route path="/owner/monthly-report" element={<MonthlyReport />} />
          <Route path="/owner/outstanding" element={<Outstanding />} />
          <Route path="/owner/master-data" element={<MasterData />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
