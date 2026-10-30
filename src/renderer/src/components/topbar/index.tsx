import React from 'react'
import { TopbarToggle } from './components/TopbarToggle'
import { TopbarOrgName } from './components/TopbarOrgName'
import { TopbarClock } from './components/TopbarClock'
import { TopbarUserProfile } from './components/TopbarUserProfile'

export interface TopbarProps {
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
  onOpenMobileSidebar: () => void
}

export const Topbar: React.FC<TopbarProps> = ({
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileSidebar
}) => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Sidebar Toggle & Organisation Name */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-4">
        <TopbarToggle
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={onToggleSidebar}
          onOpenMobileSidebar={onOpenMobileSidebar}
        />

        <TopbarOrgName />
      </div>

      {/* Right: Live Desktop Clock & User Profile with Dropdown */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <TopbarClock />

        <div className="h-6 w-px bg-slate-200/80" />

        <TopbarUserProfile />
      </div>
    </header>
  )
}

export default Topbar
