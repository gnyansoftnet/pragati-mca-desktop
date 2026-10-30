import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@renderer/components/sidebar'
import Topbar from '@renderer/components/topbar'
// import { Sidebar } from '../components/Sidebar';
// import { Topbar } from '../components/Topbar';

interface AdminLayoutProps {
  children?: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f8fafc] flex antialiased">
      {/* Dynamic Left Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content View with Topbar */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Topbar */}
        <Topbar
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children || <Outlet />}</main>
      </div>
    </div>
  )
}

export default AdminLayout
