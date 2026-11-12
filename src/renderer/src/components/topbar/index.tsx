import React from 'react'
import { TopbarToggle } from './components/TopbarToggle'
import { TopbarOrgName } from './components/TopbarOrgName'
import { TopbarClock } from './components/TopbarClock'
import { TopbarUserProfile } from './components/TopbarUserProfile'
import { TopbarMachineBadges } from './components/TopbarMachineBadges'
import { TopbarInternetBadge } from './components/TopbarInternetBadge'

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
    <header className="h-20 backdrop-blur-lg backdrop-saturate-150 bg-white/80 border-b border-slate-100/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-[0_4px_10px_rgba(15,23,42,0.10)]">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-2 sm:pr-4">
        <TopbarToggle
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={onToggleSidebar}
          onOpenMobileSidebar={onOpenMobileSidebar}
        />
        <TopbarOrgName />
      </div>

      <div className="flex items-center gap-2 sm:gap-2 shrink-0">
        <TopbarInternetBadge />
        <TopbarMachineBadges />
        <TopbarClock />
        <div className="h-6 w-px bg-slate-200/80" />
        <TopbarUserProfile />
      </div>
    </header>
  )
}

export default Topbar