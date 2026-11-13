import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, CartonOff } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'

interface SidebarSignOutProps {
  isCollapsed: boolean
}

export const SidebarSignOut: React.FC<SidebarSignOutProps> = ({ isCollapsed }) => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleSignOut = (): void => {
    logout()
    navigate('/')
  }
  const handleRejection = (): void => {
    navigate('/admin/rejection')
  }

  return (
    <div className="p-3 border-t border-slate-200 shrink-0">
      <button
        type="button"
        onClick={handleRejection}
        title={isCollapsed ? 'Rejection Entry' : undefined}
        className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-all duration-200 cursor-pointer mb-1 ${
          isCollapsed ? 'justify-center' : ''
        }`}
      >
        <CartonOff className="w-5 h-5 shrink-0 strokeWidth={2}" />
        {!isCollapsed && <span className="truncate font-medium">Rejection Entry</span>}
      </button>
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
