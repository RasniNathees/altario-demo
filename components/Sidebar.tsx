import React from 'react'
import NavItem from './NavItem'
import { LayoutDashboard, Users, FileText, LogOut } from 'lucide-react'

export const Sidebar = () => {
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
                <NavItem view='desktop' to="/" icon={LayoutDashboard}>Dashboard</NavItem>
                <NavItem view='desktop' to="/registrations" icon={Users}>Registrations</NavItem>
                <NavItem view='desktop' to="/invoices" icon={FileText}>Invoices</NavItem>
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


