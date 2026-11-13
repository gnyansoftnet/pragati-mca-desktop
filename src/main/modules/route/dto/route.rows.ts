import type { RowDataPacket } from 'mysql2'

export interface RouteRow extends RowDataPacket {
  id: number
  route_name: string
  route_code: string
}

export interface CountRow extends RowDataPacket {
  total: number
}

export interface PagedRouteRows {
  rows: RouteRow[]
  total: number
}

export interface SyncRouteRow extends RowDataPacket {
  success: number
  message: string
  total: number
}
