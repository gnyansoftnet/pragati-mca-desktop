import React from 'react'
import { useLocation } from 'react-router-dom'
import { DynamicIcon } from '../../components/DynamicIcon'
import { useAuth } from '../../context/AuthContext'
import { DynamicMenuItem } from '../../types/menu'

interface DynamicRoutePageProps {
  menuItem?: DynamicMenuItem
}

export const DynamicRoutePage: React.FC<DynamicRoutePageProps> = ({ menuItem: propMenuItem }) => {
  const { user, menus } = useAuth()
  const location = useLocation()

  // Match menu item by current path if not passed explicitly
  const pathSuffix = location.pathname.replace('/admin', '') || '/dashboard'
  const menuItem =
    propMenuItem ||
    menus.find(
      (m) =>
        m.path === pathSuffix ||
        m.path === location.pathname ||
        `/admin${m.path}` === location.pathname
    )

  const title = menuItem?.title || location.pathname.split('/').filter(Boolean).pop() || 'Module'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1">
            <span>Pragati Milk</span>
            <span>/</span>
            <span className="capitalize">{menuItem?.category || 'Module'}</span>
            <span>/</span>
            <span className="text-slate-700 font-semibold">{title}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            {menuItem && <DynamicIcon name={menuItem.icon} className="w-6 h-6 text-primary" />}
            <span>{title}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic menu route rendered from MySQL permissions for role:{' '}
            <span className="font-semibold text-teal-600">{user?.roleLabel}</span>.
          </p>
        </div>

        <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-primary rounded-full text-xs font-semibold">
          Route: {location.pathname}
        </span>
      </div>

      {/* Modern Card Shell */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-8 text-center min-h-[360px] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-primary mb-4 shadow-xs">
          {menuItem ? (
            <DynamicIcon name={menuItem.icon} className="w-8 h-8 stroke-[1.8]" />
          ) : (
            <span className="text-2xl">🥛</span>
          )}
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">{title} Management</h3>
        <p className="text-xs text-slate-500 max-w-md mb-6">
          This page is wired to the dynamic menu system. When you configure the MySQL schema for
          this module, your data tables and operations will automatically bind here.
        </p>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 font-mono">
          Allowed Roles: {menuItem?.roles.join(', ') || 'All Roles'}
        </div>
      </div>
    </div>
  )
}

export default DynamicRoutePage
