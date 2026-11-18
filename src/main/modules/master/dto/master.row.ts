import { RowDataPacket } from 'mysql2'

export interface ReasonRow extends RowDataPacket {
  id: number
  reason: string
}

export interface WeightSystemRow extends RowDataPacket {
  id: number
  system_list: string
}
export interface CansTypeRow extends RowDataPacket {
  id: number
  can_name: string
}
export interface ShiftRow extends RowDataPacket {
  id: number
  shift_name: string
  start_time: string
  end_time: string
}
export interface MilkTypeRow extends RowDataPacket {
  id: number
  milk_type: string
}
export interface MilkStatusRow extends RowDataPacket {
  id: number
  milk_status: string
}

export interface DashboardCountRow extends RowDataPacket {
  user: string
  vendor: string
  route: string
  supervisor: string
  collection: string
  analyze: string
  rejected: string
}

export interface LastSampleDateRow extends RowDataPacket {
  last_sample_date: string
}

export interface LastSynckedMasterRow extends RowDataPacket {
  id: number
  master_name: string
  last_updated: string
}
