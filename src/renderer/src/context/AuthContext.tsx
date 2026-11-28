// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
// import { UserProfile, UserRole } from '../types/auth'
// import { DynamicMenuItem } from '../types/menu'
// import { fetchMenusForRole } from '../services/mockMenuService'
// import { UserResponseDto } from '@shared/dtos/user/user.dto'

// interface AuthContextType {
//   user: UserResponseDto | null
//   role: UserRole
//   menus: DynamicMenuItem[]
//   isAuthenticated: boolean
//   isLoading: boolean
//   login: (userName: string, password?: string) => Promise<UserResponseDto>
//   logout: () => void
//   setAuthUser: (user: UserResponseDto) => void
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// const AUTH_STORAGE_KEY = 'pragati_mca_auth_user'

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   // Load saved user from localStorage on app launch
//   const [user, setUser] = useState<UserResponseDto | null>(() => {
//     try {
//       const saved = localStorage.getItem(AUTH_STORAGE_KEY)
//       return saved ? JSON.parse(saved) : null
//     } catch {
//       return null
//     }
//   })

//   const [role, setRole] = useState<UserRole>('admin')
//   const [menus, setMenus] = useState<DynamicMenuItem[]>([])
//   const [isLoading, setIsLoading] = useState<boolean>(false)

//   // Map backend role (e.g. 'Admin Web') to frontend UserRole ('admin' | 'staff' | 'farmer')
//   const mapRoleToUserRole = (rawRole: string): UserRole => {
//     const lower = (rawRole || '').toLowerCase()
//     if (lower.includes('staff') || lower.includes('operator')) return 'staff'
//     if (lower.includes('farmer')) return 'farmer'
//     return 'admin'
//   }

//   // Helper to format user object with avatar and labels
//   const formatUser = (userData: any): UserResponseDto => {
//     const rawName = userData.userName || 'User'
//     const initials = rawName.slice(0, 2).toUpperCase()

//     return {
//       ...userData,
//       name: rawName,
//       roleLabel: userData.role || 'Admin Web',
//       avatar: initials,
//       // email: `${rawName.toLowerCase()}@pragatimilk.com`
//     }
//   }

//   // Load menus when user changes
//   useEffect(() => {
//     if (user) {
//       const userRole = mapRoleToUserRole(user.role)
//       setRole(userRole)
//       fetchMenusForRole(userRole).then((fetchedMenus) => {
//         setMenus(fetchedMenus)
//       })
//     } else {
//       setMenus([])
//     }
//   }, [user])

//   // Login with username and password via window.api.login
//   const login = async (userName: string, password = ''): Promise<UserResponseDto> => {
//     setIsLoading(true)
//     try {
//       const result = await window.api.login(userName, password)
//       if (!result || !result.id) {
//         throw new Error('Invalid user response from server')
//       }

//       const formatted = formatUser(result)
//       setUser(formatted)
//       localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(formatted))

//       const userRole = mapRoleToUserRole(formatted.role)
//       const fetchedMenus = await fetchMenusForRole(userRole)
//       setMenus(fetchedMenus)

//       return formatted
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const setAuthUser = (userData: UserResponseDto) => {
//     const formatted = formatUser(userData)
//     setUser(formatted)
//     localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(formatted))
//   }

//   const logout = () => {
//     setUser(null)
//     setMenus([])
//     localStorage.removeItem(AUTH_STORAGE_KEY)
//   }

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         role,
//         menus,
//         isAuthenticated: !!user,
//         isLoading,
//         login,
//         logout,
//         setAuthUser
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext)
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider')
//   }
//   return context
// }

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserRole } from '../types/auth'
import { DynamicMenuItem } from '../types/menu'
import { UserResponseDto } from '@shared/dtos/user/user.dto'
import { fetchUserMenus, getFixedMenus } from '../services/menuService'

interface AuthContextType {
  user: UserResponseDto | null
  role: UserRole
  menus: DynamicMenuItem[]
  isAuthenticated: boolean
  isLoading: boolean
  login: (userName: string, password?: string) => Promise<UserResponseDto>
  logout: () => void
  setAuthUser: (user: UserResponseDto) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = 'pragati_mca_auth_user'
const MENU_STORAGE_KEY = 'pragati_mca_user_menus'

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load saved user from localStorage on app launch
  const [user, setUser] = useState<UserResponseDto | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [role, setRole] = useState<UserRole>('admin')

  // Initial menu state from localStorage or fixed menus
  const [menus, setMenus] = useState<DynamicMenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(MENU_STORAGE_KEY)
      return saved ? JSON.parse(saved) : getFixedMenus()
    } catch {
      return getFixedMenus()
    }
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Map backend role (e.g. 'Admin Web') to frontend UserRole ('admin' | 'staff' | 'farmer')
  const mapRoleToUserRole = (rawRole: string): UserRole => {
    const lower = (rawRole || '').toLowerCase()
    if (lower.includes('staff') || lower.includes('operator')) return 'staff'
    if (lower.includes('farmer')) return 'farmer'
    return 'admin'
  }

  // Helper to format user object with avatar and labels
  const formatUser = (userData: any): UserResponseDto => {
    const rawName = userData.userName || 'User'
    const initials = rawName.slice(0, 2).toUpperCase()

    return {
      ...userData,
      name: rawName,
      roleLabel: userData.role || 'Admin Web',
      avatar: initials
    }
  }

  // Load menus when user changes or restores on page reload
  useEffect(() => {
    if (user) {
      const userRole = mapRoleToUserRole(user.role)
      setRole(userRole)

      const targetUserId = user.userId || user.id
      fetchUserMenus(targetUserId).then((dynamicMenus) => {
        setMenus(dynamicMenus)
        localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(dynamicMenus))
      })
    } else {
      setMenus(getFixedMenus())
      localStorage.removeItem(MENU_STORAGE_KEY)
    }
  }, [user])

  // Login with username and password via window.api.login
  const login = async (userName: string, password = ''): Promise<UserResponseDto> => {
    setIsLoading(true)
    try {
      const result = await window.api.login(userName, password)
      if (!result || !result.id) {
        throw new Error('Invalid user response from server')
      }

      const formatted = formatUser(result)
      setUser(formatted)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(formatted))

      const userRole = mapRoleToUserRole(formatted.role)
      setRole(userRole)

      // Fetch dynamic menu using userId from login result
      const targetUserId = formatted.userId || formatted.id
      const dynamicMenus = await fetchUserMenus(targetUserId)
      setMenus(dynamicMenus)
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(dynamicMenus))

      return formatted
    } finally {
      setIsLoading(false)
    }
  }

  const setAuthUser = (userData: UserResponseDto) => {
    const formatted = formatUser(userData)
    setUser(formatted)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(formatted))
  }

  const logout = () => {
    setUser(null)
    setMenus(getFixedMenus())
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(MENU_STORAGE_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        menus,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        setAuthUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}