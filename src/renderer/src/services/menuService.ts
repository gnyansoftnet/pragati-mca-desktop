import { DynamicMenuItem, SubMenuItem } from '../types/menu'
import { PermissionDto } from '@shared/dtos/user/permission.dto'

// Mapping known page names to application route paths
const ROUTE_PATH_MAP: Record<string, string> = {
  // Fixed & Standalone Menus
  dashboard: '/dashboard',
  'machine connection': '/machine-connection',
  'procurement collection': '/procurement-collection',
  'manual collection': '/manual-collection',
  analyze: '/analyze',
  'rejection entry': '/rejection-entry',
  'transport entry': '/transport-entry',
  transport: '/transport-entry',

  // Master Submenus
  routes: '/routes',
  'routes master': '/routes',
  vendors: '/vendors',
  'vendors master': '/vendors',
  supervisors: '/supervisors',
  'supervisors master': '/supervisors',
  users: '/users',
  'users master': '/users',

  // Report Submenus
  'periodic report': '/periodic-report',
  'truck sheet report': '/truck-sheet',
  'truck sheet': '/truck-sheet',
  'rejection report': '/rejection-report'
}

// Default icons if pageIcon is not provided
const DEFAULT_ICON_MAP: Record<string, string> = {
  dashboard: 'LayoutDashboard',
  'machine connection': 'MonitorSpeaker',
  'procurement collection': 'Milk',
  'manual collection': 'TestTubes',
  analyze: 'FileSpreadsheet',
  master: 'Users',
  reports: 'FileText',
  routes: 'Banknote',
  vendors: 'Users',
  supervisors: 'FolderUsers',
  users: 'Users',
  'rejection entry': 'CartonOff',
  'transport entry': 'Truck',
  'periodic report': 'ListFilter',
  'truck sheet report': 'Car',
  'rejection report': 'TestTubes'
}

export const getRoutePath = (pageName: string): string => {
  const clean = pageName.trim().toLowerCase()
  if (ROUTE_PATH_MAP[clean]) {
    return ROUTE_PATH_MAP[clean]
  }
  // Generic fallback: slugify
  return `/${clean.replace(/\s+/g, '-')}`
}

export const getDefaultIcon = (name: string): string => {
  const clean = name.trim().toLowerCase()
  return DEFAULT_ICON_MAP[clean] || 'CircleDot'
}

// 2 Fixed initial menus: Dashboard and Machine Connection
export const getFixedMenus = (): DynamicMenuItem[] => [
  {
    id: 'fixed-dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['admin', 'staff', 'farmer'],
    category: 'dashboard',
    order_index: 10
  },
  {
    id: 'fixed-machine-connection',
    title: 'Machine Connection',
    path: '/machine-connection',
    icon: 'MonitorSpeaker',
    roles: ['admin', 'staff', 'farmer'],
    category: 'operations',
    order_index: 20
  }
]


export const transformDynamicMenus = (rawPermissions: PermissionDto[]): DynamicMenuItem[] => {
  const fixedMenus = getFixedMenus()

  if (!rawPermissions || !Array.isArray(rawPermissions)) {
    return fixedMenus
  }

  // 1. Only include items where isAccess === 1 (or '1')
  const accessibleItems = rawPermissions.filter((item) => Number(item.isAccess) === 1)

  const dynamicList: DynamicMenuItem[] = []
  let masterParent: DynamicMenuItem | null = null
  let reportsParent: DynamicMenuItem | null = null

  accessibleItems.forEach((item, index) => {
    const rawName = (item.pageName || '').trim()
    const lowerName = rawName.toLowerCase()

    // 2. Master grouping: if "Master" is in pageName
    if (lowerName.includes('master')) {
      // Remove "Master" from submenu title (e.g. "Routes Master" -> "Routes")
      const subTitle = rawName.replace(/master/gi, '').trim() || rawName
      const subItem: SubMenuItem = {
        id: item.id || `master-${index}`,
        title: subTitle,
        path: getRoutePath(subTitle),
        icon: item.pageIcon || getDefaultIcon(subTitle)
      }

      if (!masterParent) {
        masterParent = {
          id: 'parent-master',
          title: 'Master',
          path: '',
          icon: 'Users',
          roles: ['admin', 'staff'],
          category: 'master',
          order_index: 50,
          children: []
        }
        dynamicList.push(masterParent)
      }

      masterParent.children!.push(subItem)
      return
    }

    // 3. Reports grouping: if "Report" is in pageName
    if (lowerName.includes('report')) {
      const subItem: SubMenuItem = {
        id: item.id || `report-${index}`,
        title: rawName,
        path: getRoutePath(rawName),
        icon: item.pageIcon || getDefaultIcon(rawName)
      }

      if (!reportsParent) {
        reportsParent = {
          id: 'parent-reports',
          title: 'Reports',
          path: '',
          icon: 'FileText',
          roles: ['admin', 'staff'],
          category: 'reports',
          order_index: 60,
          children: []
        }
        dynamicList.push(reportsParent)
      }

      reportsParent.children!.push(subItem)
      return
    }

    // 4. Standalone Menus (e.g. Procurement Collection, Manual Collection, Analyze, Rejection Entry)
    const standaloneItem: DynamicMenuItem = {
      id: item.id || `menu-${index}`,
      title: rawName,
      path: getRoutePath(rawName),
      icon: item.pageIcon || getDefaultIcon(rawName),
      roles: ['admin', 'staff', 'farmer'],
      category: 'operations',
      order_index: 30 + index
    }

    dynamicList.push(standaloneItem)
  })

  return [...fixedMenus, ...dynamicList]
}


export const fetchUserMenus = async (userId: number): Promise<DynamicMenuItem[]> => {
  try {
    if (window.api && typeof window.api.getMenu === 'function') {
      const rawPermissions = await window.api.getMenu(userId)
      if (rawPermissions && Array.isArray(rawPermissions) && rawPermissions.length > 0) {
        return transformDynamicMenus(rawPermissions)
      }
    }
  } catch (error) {
    console.error('Failed to fetch dynamic menus for userId:', userId, error)
  }
  return getFixedMenus()
}