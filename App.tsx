

import { HashRouter as Router, Routes, Route, } from 'react-router-dom';


import DashboardLayout from './pages/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Registrations from './pages/Registrations';
import Invoices from './pages/Invoices';


export default function App() {

  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/registrations" element={<Registrations />} />
          <Route path="/invoices" element={<Invoices />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}
