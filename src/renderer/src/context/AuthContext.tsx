import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserProfile, UserRole } from '../types/auth'
import { DynamicMenuItem } from '../types/menu'
import { MOCK_USERS, fetchMenusForRole } from '../services/mockMenuService'

interface AuthContextType {
  user: UserProfile | null
  role: UserRole
  menus: DynamicMenuItem[]
  isAuthenticated: boolean
  isLoading: boolean
  login: (role: UserRole, email?: string) => Promise<void>
  logout: () => void
  switchRole: (role: UserRole) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [role, setRole] = useState<UserRole>('admin')
  const [menus, setMenus] = useState<DynamicMenuItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Update dynamic menus whenever role changes
  useEffect(() => {
    if (user) {
      setIsLoading(true)
      fetchMenusForRole(user.role).then((fetchedMenus) => {
        setMenus(fetchedMenus)
        setIsLoading(false)
      })
    } else {
      setMenus([])
    }
  }, [user])

  const login = async (selectedRole: UserRole, email?: string) => {
    setIsLoading(true)
    // Simulating login auth check
    const mockUser = {
      ...MOCK_USERS[selectedRole],
      email: email && email.includes('@') ? email : MOCK_USERS[selectedRole].email
    }
    setUser(mockUser)
    setRole(selectedRole)
    const fetched = await fetchMenusForRole(selectedRole)
    setMenus(fetched)
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    setMenus([])
  }

  const switchRole = async (newRole: UserRole) => {
    setIsLoading(true)
    const newUser = MOCK_USERS[newRole]
    setUser(newUser)
    setRole(newRole)
    const fetched = await fetchMenusForRole(newRole)
    setMenus(fetched)
    setIsLoading(false)
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
        switchRole
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
