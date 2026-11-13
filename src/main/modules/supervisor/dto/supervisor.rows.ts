import type { RowDataPacket } from 'mysql2'

export interface SupervisorRow extends RowDataPacket {
  id: number
  employee_id: string
  first_name: string
  last_name: string
  contact_no: string
  plant: string
}

export interface CountRow extends RowDataPacket {
  total: number
}

export interface PagedSupervisorRows {
  rows: SupervisorRow[]
  total: number
}

export interface SyncSupervisorRow extends RowDataPacket {
  success: number
  message: string
  total: number
}

