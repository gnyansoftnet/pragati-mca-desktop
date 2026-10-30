export type UserRole = 'admin' | 'staff' | 'farmer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  avatar?: string;
  centerCode?: string;
  centerName?: string;
  mobile?: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
