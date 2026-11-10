export type UserRole = 'admin' | 'staff' | 'farmer'

export interface UserProfile {
  id: number | string
  userName: string
  userCode: string
  plant: string
  role: string
  // Optional convenience / legacy UI fields
  name?: string
  roleLabel?: string
  email?: string
  avatar?: string
  branchCode?: string
  branchId?: number
  orgCode?: string
  orgId?: number
  roleId?: number
  userId?: number
}

export interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
}