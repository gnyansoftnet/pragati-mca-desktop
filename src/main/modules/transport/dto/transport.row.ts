import type { RowDataPacket } from 'mysql2'

export interface TransportRow extends RowDataPacket {
  id: number
  transport_code: string
  plant: string
  transport_date: string
  shift: string
  route_code: string
  route_name?: string | null
  trasporter: string
  vehicle_rc_no: string
  driver_name: string
  sync_date: string
  sync_status: string
  created_at: string
  updated_at: string
  d_falg: number
}

export interface CountRow extends RowDataPacket {
  total: number
}

export interface PagedTransportRows {
  rows: TransportRow[]
  total: number
}
