import type { RowDataPacket } from 'mysql2'

export interface UserRow extends RowDataPacket {
  id: number
  user_name: string
  user_code: string
  password: string
  plant: string
  role: string
}
