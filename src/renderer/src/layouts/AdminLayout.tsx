
// import React, { useState } from 'react'
// import { Outlet } from 'react-router-dom'
// import Sidebar from '@renderer/components/sidebar'
// import Topbar from '@renderer/components/topbar'

// interface AdminLayoutProps {
//   children?: React.ReactNode
// }

// export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
//   const [isMobileOpen, setIsMobileOpen] = useState(false)

//   return (
//     <div className="h-screen max-h-screen bg-[#e2ebf3] flex antialiased overflow-hidden">
//       <Sidebar
//         isCollapsed={isSidebarCollapsed}
//         isMobileOpen={isMobileOpen}
//         onCloseMobile={() => setIsMobileOpen(false)}
//       />
//       <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
//         <Topbar
//           isSidebarCollapsed={isSidebarCollapsed}
//           onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
//           onOpenMobileSidebar={() => setIsMobileOpen(true)}
//         />
//         <main className="flex-1 p-2 sm:p-3 lg:p-4 overflow-y-auto">{children || <Outlet />}</main>
//       </div>
//     </div>
//   )
// }

// export default AdminLayout


import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@renderer/components/sidebar'
import Topbar from '@renderer/components/topbar'
import { useShiftAutoLogout } from '@renderer/hooks/useShiftAutoLogout' // 1. Import hook

interface AdminLayoutProps {
  children?: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // 2. Activate Auto-Logout monitoring for Procurement Collection users
  useShiftAutoLogout()

  return (
    <div className="h-screen max-h-screen bg-[#e2ebf3] flex antialiased overflow-hidden">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Topbar
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
        />
        <main className="flex-1 p-2 sm:p-3 lg:p-4 overflow-y-auto">{children || <Outlet />}</main>
      </div>
    </div>
  )
}

export default AdminLayout