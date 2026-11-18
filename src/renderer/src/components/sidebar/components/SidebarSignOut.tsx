import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, CartonOff, CircleX, CircleCheck, Car } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'

interface SidebarSignOutProps {
  isCollapsed: boolean
}

export const SidebarSignOut: React.FC<SidebarSignOutProps> = ({ isCollapsed }) => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const location = useLocation()
  const isAnalyzedActive = location.pathname === '/admin/analyzed-sample'
  const isRejectedActive = location.pathname === '/admin/rejected-sample'
  // const isTransportActive = location.pathname === '/admin/transport-sample'

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
  // const handleTransport = () => {
  //   navigate('/admin/transport-sample')
  // }

  return (
    <div className="p-3 border-t border-slate-200 shrink-0 shadow-[0_-4px_8px_rgba(0,0,0,0.08)]">
      <button
        type="button"
        onClick={handleAnalyzed}
        title={isCollapsed ? 'Analyzed Samples' : undefined}
        className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer mb-1 ${
          isAnalyzedActive
            ? 'bg-linear-to-r from-primary to-secondary text-white shadow-md shadow-primary/25'
            : 'text-slate-500 hover:text-sky-600 hover:bg-sky-50'
        } ${isCollapsed ? 'justify-center' : ''}`}
      >
        <CircleCheck className="w-5 h-5 shrink-0" strokeWidth={2} />
        {!isCollapsed && <span className="truncate font-medium">Analyzed Samples</span>}
      </button>
      <button
        type="button"
        onClick={handleRejected}
        title={isCollapsed ? 'Rejected Samples' : undefined}
        className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer mb-1 ${
          isRejectedActive
            ? 'bg-linear-to-r from-primary to-secondary text-white shadow-md shadow-primary/25'
            : 'text-slate-500 hover:text-sky-600 hover:bg-sky-50'
        } ${isCollapsed ? 'justify-center' : ''}`}
      >
        <CircleX className="w-5 h-5 shrink-0" strokeWidth={2} />
        {!isCollapsed && <span className="truncate font-medium">Rejected Samples</span>}
      </button>

      {/* <button
        type="button"
        onClick={handleTransport}
        title={isCollapsed ? 'Transport Data' : undefined}
        className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer mb-1 ${
          isTransportActive
            ? 'bg-linear-to-r from-primary to-secondary text-white shadow-md shadow-primary/25'
            : 'text-slate-500 hover:text-sky-600 hover:bg-sky-50'
        } ${isCollapsed ? 'justify-center' : ''}`}
      >
        <Car className="w-5 h-5 shrink-0" strokeWidth={2} />
        {!isCollapsed && <span className="truncate font-medium">Transport Data</span>}
      </button>  */}
      <button
        type="button"
        onClick={handleSignOut}
        title={isCollapsed ? 'Logout' : undefined}
        className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium bg-rose-50 text-rose-600 hover:bg-rose-50 transition-all duration-200 cursor-pointer ${
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
