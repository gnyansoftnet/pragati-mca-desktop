import type { RowDataPacket } from 'mysql2'

export interface MilkRejectionRow extends RowDataPacket {
  id: number
  plant: string
  dsk_name: string
  dsk_code: string
  route: string
  supervisor: string
  shift: string
  no_of_canes: string
  aprox_quantity: string
  reason: string
  sync_status: string
  created_at: string
  updated_at: string
}

export interface ReasonRow extends RowDataPacket {
  id: number
  reason: string
}

export interface CountRow extends RowDataPacket {
  total: number
}

export interface PagedMilkRejectionRows {
  rows: MilkRejectionRow[]
  total: number
}
