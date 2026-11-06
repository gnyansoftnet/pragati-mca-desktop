import type { RowDataPacket } from 'mysql2'

export interface VendorRow extends RowDataPacket {
  id: number
  dsk_name: string
  dsk_code: string
  vendor_code: string
  mobile_number: string
  route_code: string
  supervisor_emp_id: string
}

export type VendorListRow = Pick<VendorRow, 'id' | 'dsk_code' | 'dsk_name' | 'vendor_code'>

export interface CountRow extends RowDataPacket {
  total: number
}

export interface PagedVendorRows {
  rows: VendorRow[]
  total: number
}
