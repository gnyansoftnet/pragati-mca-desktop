export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  created_at: string | Date
}

export interface CreateUserDto {
  name: string
  email: string
  phone?: string
}

export interface UpdateUserDto {
  name: string
  email: string
  phone?: string
}
