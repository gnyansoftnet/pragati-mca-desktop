import { RowDataPacket } from 'mysql2'

export interface RejectionReportRow extends RowDataPacket {
  id: number
  rejection_code: string
  plant: string
  dsk_name: string
  dsk_code: string
  route: string
  route_name?: string | null
  supervisor: string
  supervisor_name?: string | null
  shift: string
  shift_name?: string | null
  no_of_canes: string
  aprox_quantity: string
  reason: string
  sync_status: string
  sync_at: string
  created_at: string
  updated_at: string
  d_flag: number
}
export interface CountRow extends RowDataPacket {
  total: number
}

export interface RejectionReportPagedRows {
  rows: RejectionReportRow[]
  total: number
}
