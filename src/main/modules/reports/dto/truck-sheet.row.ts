import { RowDataPacket } from 'mysql2'

export interface TruckSheetRow extends RowDataPacket {
  id: number
  trans_code: string
  plant: string
  user_code: string
  root_code: string
  route_name?: string | null
  vendor_code: string
  dsk_name?: string | null
  shift: number
  shift_name?: string | null
  sample_date: string
  sample_code: number
  can_type: string
  weight_system: string
  milk_type: string
  milk_type_name?: string | null
  milk_status: string
  milk_status_name?: string | null
  tiping_time: string
  no_of_cans: number
  gross_weight: number
  net_weight: number
  net_ltr: number
  fat: number
  snf: number
  clr: number
  is_analyse: number
  entry: string
  sync_status: string
  sync_date: string
  created_at: string
  updated_at: string
  d_flag: number
}
export interface CountRow extends RowDataPacket {
  total: number
}

export interface TruckSheetPagedRows {
  rows: TruckSheetRow[]
  total: number
}
