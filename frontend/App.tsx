import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Consultation from './pages/Consultation';
import Summary from './pages/Summary';
import History from './pages/History';

import DashboardLayout from './components/DashboardLayout';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/summary" element={<Summary />} />

        {/* Dashboard Routes wrapped in a layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<History />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;