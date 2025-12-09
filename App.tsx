
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch, fetchDashboardStats } from './store/store';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Registrations from './pages/Registrations';
import Invoices from './pages/Invoices';

function NavItem({ to, icon: Icon, children }: { to: string; icon: any; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <NavLink 
      to={to} 
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group ${
        isActive 
          ? 'bg-primary text-primary-foreground shadow-md' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : 'text-slate-500 group-hover:text-slate-900'}`} />
      <span className="font-medium text-sm">{children}</span>
    </NavLink>
  );
}

function Sidebar() {
    return (
        <div className="w-64 border-r bg-white h-screen fixed left-0 top-0 flex flex-col z-10 hidden md:flex shadow-sm">
            <div className="p-6 border-b">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-white font-bold">R</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-900">RegiFlow</span>
                </div>
            </div>
            <div className="flex-1 p-4 space-y-1">
                <NavItem to="/" icon={LayoutDashboard}>Dashboard</NavItem>
                <NavItem to="/registrations" icon={Users}>Registrations</NavItem>
                <NavItem to="/invoices" icon={FileText}>Invoices</NavItem>
            </div>
            <div className="p-4 border-t">
                 <button className="flex items-center gap-3 px-3 py-2 w-full text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm font-medium">
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                 </button>
            </div>
        </div>
    )
}

function MobileNav() {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around z-50">
            <NavLink to="/" className={({isActive}) => `p-2 rounded-full ${isActive ? 'bg-slate-100 text-primary' : 'text-slate-500'}`}><LayoutDashboard className="h-5 w-5"/></NavLink>
            <NavLink to="/registrations" className={({isActive}) => `p-2 rounded-full ${isActive ? 'bg-slate-100 text-primary' : 'text-slate-500'}`}><Users className="h-5 w-5"/></NavLink>
            <NavLink to="/invoices" className={({isActive}) => `p-2 rounded-full ${isActive ? 'bg-slate-100 text-primary' : 'text-slate-500'}`}><FileText className="h-5 w-5"/></NavLink>
        </div>
    )
}

function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50/50">
            <Sidebar />
            <div className="md:pl-64 flex flex-col min-h-screen pb-16 md:pb-0">
                 {/* Top Header for Mobile */}
                 <div className="md:hidden bg-white border-b p-4 flex items-center justify-center sticky top-0 z-40">
                    <span className="font-bold text-lg">RegiFlow</span>
                 </div>
                 
                 <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                 </main>
            </div>
            <MobileNav />
        </div>
    )
}

export default function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
     // Prefetch critical dashboard stats on app mount so the first screen is ready
     dispatch(fetchDashboardStats());
  }, [dispatch]);

  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/registrations" element={<Registrations />} />
          <Route path="/invoices" element={<Invoices />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
