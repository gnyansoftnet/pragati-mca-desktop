import { RowDataPacket } from 'mysql2'

export interface MilkCollectionRow extends RowDataPacket {
  id: number
  trans_code: string
  plant: string
  user_code: string
  root_code: string
  root_name: string
  vendor_code: string
  dsk_name: string
  shift: number
  sample_date: string
  sample_code: number
  can_type: string
  weight_system: string
  milk_type: string
  milk_status: string
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

export interface MilkCollectionPagedRows {
  rows: MilkCollectionRow[]
  total: number
}
