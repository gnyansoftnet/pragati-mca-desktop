import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight, Circle } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { DynamicIcon } from '../../DynamicIcon'
import { DynamicMenuItem } from '../../../types/menu'

interface SidebarMenuProps {
  isCollapsed: boolean
  onCloseMobile: () => void
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ isCollapsed, onCloseMobile }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { menus } = useAuth()

  // Track expanded parent menus (e.g., Farmers)
  const [expandedMenus, setExpandedMenus] = useState<Record<string | number, boolean>>({
    2: true // Default expand Farmers (id: 2)
  })

  // Auto-expand if current route matches a child
  useEffect(() => {
    menus.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) => {
          const childTarget = child.path.startsWith('/admin') ? child.path : `/admin${child.path}`
          return location.pathname === childTarget
        })
        if (isChildActive) {
          setExpandedMenus((prev) => ({ ...prev, [item.id]: true }))
        }
      }
    })
  }, [location.pathname, menus])

  const toggleSubmenu = (itemId: string | number): void => {
    setExpandedMenus((prev) => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const handleMenuClick = (item: DynamicMenuItem): void => {
    if (item.children && item.children.length > 0) {
      toggleSubmenu(item.id)
    } else {
      const target = item.path.startsWith('/admin') ? item.path : `/admin${item.path}`
      navigate(target)
      onCloseMobile()
    }
  }

  const handleSubmenuClick = (subPath: string): void => {
    const target = subPath.startsWith('/admin') ? subPath : `/admin${subPath}`
    navigate(target)
    onCloseMobile()
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200">
      {menus.length === 0 ? (
        <div className="p-4 text-center text-xs text-slate-400">Loading menus...</div>
      ) : (
        menus.map((item) => {
          const target = item.path.startsWith('/admin') ? item.path : `/admin${item.path}`
          const isDirectActive =
            location.pathname === target ||
            (item.path === '/dashboard' &&
              (location.pathname === '/admin' || location.pathname === '/admin/'))

          const hasChildren = item.children && item.children.length > 0
          const isExpanded = !!expandedMenus[item.id]

          // Check if any child is currently active
          const isAnyChildActive = hasChildren
            ? item.children!.some((c) => {
              const cTarget = c.path.startsWith('/admin') ? c.path : `/admin${c.path}`
              return location.pathname === cTarget
            })
            : false

          const isParentActive = isDirectActive || isAnyChildActive

          return (
            <div key={item.id} className="space-y-1">
              {/* Parent Item */}
              <button
                type="button"
                onClick={() => handleMenuClick(item)}
                title={isCollapsed ? item.title : undefined}
                className={`w-full group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer ${isParentActive && !hasChildren
                  ? 'bg-linear-to-r from-primary to-secondary text-white shadow-md shadow-primary/25 font-semibold'
                  : isParentActive && hasChildren
                    ? 'bg-teal-50/70 text-primary font-semibold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
              >
                <div
                  className={`shrink-0 transition-transform group-hover:scale-105 ${isParentActive && !hasChildren
                    ? 'text-white'
                    : isParentActive
                      ? 'text-primary'
                      : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                >
                  <DynamicIcon name={item.icon} className="w-5 h-5 strokeWidth={2}" />
                </div>

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-left">
                    <span className="truncate">{item.title}</span>
                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${isParentActive && !hasChildren
                            ? 'bg-white/20 text-white'
                            : 'bg-teal-50 text-teal-700 border border-teal-100'
                            }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Submenu Expand Chevron */}
                      {hasChildren && (
                        <div className="text-slate-400 group-hover:text-slate-600 transition-transform duration-200">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-primary" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </button>

              {/* Submenu Accordion Items (e.g. Under "Farmers") */}
              {hasChildren && isExpanded && !isCollapsed && (
                <div className="pl-6 pr-2 py-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {item.children!.map((subItem) => {
                    const subTarget = subItem.path.startsWith('/admin')
                      ? subItem.path
                      : `/admin${subItem.path}`
                    const isSubActive = location.pathname === subTarget

                    return (
                      <button
                        key={subItem.id}
                        type="button"
                        onClick={() => handleSubmenuClick(subItem.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${isSubActive
                          ? 'bg-linear-to-r from-primary to-secondary text-white shadow-xs font-semibold'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
                          }`}
                      >
                        <div
                          className={`shrink-0 ${isSubActive ? 'text-white' : 'text-slate-300'}`}
                        >
                          {subItem.icon ? (
                            <DynamicIcon name={subItem.icon} className="w-3.5 h-3.5" />
                          ) : (
                            <Circle className="w-2 h-2 fill-current" />
                          )}
                        </div>
                        <span className="truncate text-left flex-1">{subItem.title}</span>
                        {subItem.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                            {subItem.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

export default SidebarMenu
