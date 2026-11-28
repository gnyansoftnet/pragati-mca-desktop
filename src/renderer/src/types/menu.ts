import { UserRole } from './auth'

export type MenuCategory = 'dashboard' | 'master' | 'operations' | 'reports' | 'others'

// export interface SubMenuItem {
//   id: number | string
//   title: string
//   path: string
//   icon?: string
//   pageId?: number | string 
//   badge?: string | number
// }

// export interface DynamicMenuItem {
//   id: number | string
//   title: string
//   path: string
//   icon: string
//   roles: UserRole[]
//   category: MenuCategory
//   order_index: number
//   pageId?: number | string 
//   badge?: string | number
//   badgeColor?: string
//   is_active?: boolean
//   children?: SubMenuItem[]
// }


export interface SubMenuItem {
  id: number | string
  pageId?: number | string
  title: string
  path: string
  badge?: string | number
  icon?: string
}
export interface DynamicMenuItem {
  id: number | string
  pageId?: number | string
  title: string
  path: string
  icon: string
  badge?: string | number
  children?: SubMenuItem[]
}