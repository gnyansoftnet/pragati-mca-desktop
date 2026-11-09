import type { RowDataPacket } from 'mysql2'

export interface UserRow extends RowDataPacket {
  id: number
  user_name: string
  user_code: string
  password: string
  branch_code: string
  org_code: string
  plant: string
  role: string
  org_id: number
  branch_id: number
  role_id: number
  user_id: number
}

export interface SyncUserRow extends RowDataPacket {
  success: number
  message: string
  total: number
}
export interface SyncUser {
  success: number
  message: string
  total: number
}
