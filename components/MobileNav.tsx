import React from 'react'
import NavItem from './NavItem'
import { LayoutDashboard, Users, FileText } from 'lucide-react' 
export const MobileNav = ()=> {
  return (
     <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around z-50">
            <NavItem to="/" view="mobile" icon={LayoutDashboard}></NavItem>
            <NavItem to="/registrations" view="mobile" icon={Users}></NavItem>
            <NavItem to="/invoices"  view="mobile" icon={FileText}></NavItem>
        </div>
  )
}

export default MobileNav
