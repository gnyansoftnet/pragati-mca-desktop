import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LogOut,
  ChevronDown,
  ChevronRight,
  FileCheck,
  AlertTriangle,
  Car,
  Layers
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'

interface SidebarSignOutProps {
  isCollapsed: boolean
}

export const SidebarSignOut: React.FC<SidebarSignOutProps> = ({ isCollapsed }) => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const location = useLocation()

  // Track active sub-routes
  const isAnalyzedActive = location.pathname === '/admin/analyzed-sample'
  const isRejectedActive = location.pathname === '/admin/rejected-sample'
  const isTransportActive = location.pathname === '/admin/transport-sample'
  const isParentActive = isAnalyzedActive || isRejectedActive || isTransportActive

  // Accordion state (expanded by default or when an item is active)
  const [isExpanded, setIsExpanded] = useState<boolean>(true)

  // Auto-expand if current route matches any child
  useEffect(() => {
    if (isParentActive) {
      setIsExpanded(true)
    }
  }, [location.pathname, isParentActive])

  const toggleSubmenu = (): void => {
    setIsExpanded((prev) => !prev)
  }

  const handleSignOut = (): void => {
    logout()
    navigate('/')
  }

  const handleRejected = (): void => {
    navigate('/admin/rejected-sample')
  }

  const handleAnalyzed = (): void => {
    navigate('/admin/analyzed-sample')
  }

  const handleTransport = (): void => {
    navigate('/admin/transport-sample')
  }

  return (
    <div className="p-3 border-t border-slate-200 shrink-0 shadow-[0_-4px_8px_rgba(0,0,0,0.08)] space-y-1.5">
      {/* Samples Parent Accordion */}
      <div className="space-y-1">
        <button
          type="button"
          onClick={toggleSubmenu}
          title={isCollapsed ? 'Push To Server' : undefined}
          className={`w-full group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer ${
            isParentActive
              ? 'bg-teal-50/70 text-primary font-semibold'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          } ${isCollapsed ? 'justify-center' : ''}`}
        >
          <div
            className={`shrink-0 transition-transform group-hover:scale-105 ${
              isParentActive ? 'text-primary' : 'text-slate-800 group-hover:text-slate-600'
            }`}
          >
            <Layers className="w-5 h-5 strokeWidth={2}" />
          </div>

          {!isCollapsed && (
            <div className="flex-1 flex items-center justify-between text-left">
              <span className="truncate">Push To Server</span>
              <div className="text-slate-800 group-hover:text-slate-600 transition-transform duration-200">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-primary" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </div>
          )}
        </button>

        {/* Submenu Accordion Items */}
        {isExpanded && !isCollapsed && (
          <div className="pl-6 pr-2 py-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
            <button
              type="button"
              onClick={handleAnalyzed}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                isAnalyzedActive
                  ? 'bg-linear-to-r from-primary to-secondary text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
              }`}
            >
              <div className={`shrink-0 ${isAnalyzedActive ? 'text-white' : 'text-slate-400'}`}>
                <FileCheck className="w-3.5 h-3.5" />
              </div>
              <span className="truncate text-left flex-1">Procurement Samples</span>
            </button>

            <button
              type="button"
              onClick={handleRejected}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                isRejectedActive
                  ? 'bg-linear-to-r from-primary to-secondary text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
              }`}
            >
              <div className={`shrink-0 ${isRejectedActive ? 'text-white' : 'text-slate-400'}`}>
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <span className="truncate text-left flex-1">Rejected Samples</span>
            </button>

            {/* <button
              type="button"
              onClick={handleTransport}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                isTransportActive
                  ? 'bg-linear-to-r from-primary to-secondary text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
              }`}
            >
              <div className={`shrink-0 ${isTransportActive ? 'text-white' : 'text-slate-400'}`}>
                <Car className="w-3.5 h-3.5" />
              </div>
              <span className="truncate text-left flex-1">Transport Data</span>
            </button> */}
          </div>
        )}
      </div>

      {/* Logout Button */}
      <button
        type="button"
        onClick={handleSignOut}
        title={isCollapsed ? 'Logout' : undefined}
        className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium bg-rose-50 text-rose-600 hover:bg-rose-100/80 transition-all duration-200 cursor-pointer ${
          isCollapsed ? 'justify-center' : ''
        }`}
      >
        <LogOut className="w-5 h-5 shrink-0 strokeWidth={2}" />
        {!isCollapsed && <span className="truncate font-medium">Logout</span>}
      </button>
    </div>
  )
}

export default SidebarSignOut