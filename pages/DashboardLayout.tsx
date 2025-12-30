import React from 'react'
import {Sidebar,MobileNav} from '@/components';


function DashboardLayout({children}:{children:React.ReactNode}) {
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

export default DashboardLayout
