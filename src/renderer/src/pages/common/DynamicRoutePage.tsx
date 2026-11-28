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
      Default
    </div>
  )
}

export default DynamicRoutePage
