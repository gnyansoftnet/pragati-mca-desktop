import { RowDataPacket } from 'mysql2'

export interface PermissionRow extends RowDataPacket {
  id: number
  user_id: number
  is_access: string
  page_id: string
  page_name: string
  page_icon: string
}
