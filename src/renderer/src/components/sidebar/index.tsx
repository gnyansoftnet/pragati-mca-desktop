import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { SidebarLogo } from './components/SidebarLogo'
import { SidebarMenu } from './components/SidebarMenu'
import { SidebarSignOut } from './components/SidebarSignOut'

export interface SidebarProps {
  isCollapsed: boolean
  isMobileOpen: boolean
  onCloseMobile: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, isMobileOpen, onCloseMobile }) => {
  const { user } = useAuth()

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidenav Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-100/90 flex flex-col justify-between transition-all duration-300 ease-in-out select-none shadow-sm lg:shadow-none ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <SidebarLogo isCollapsed={isCollapsed} roleLabel={user?.roleLabel} />

        {/* Dynamic Menus with Submenus */}
        <SidebarMenu isCollapsed={isCollapsed} onCloseMobile={onCloseMobile} />

        {/* Sign Out Action */}
        <SidebarSignOut isCollapsed={isCollapsed} />
      </aside>
    </>
  )
}

export default Sidebar
