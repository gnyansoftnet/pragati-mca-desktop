import { RowDataPacket } from 'mysql2'

export interface MilkSampleRow extends RowDataPacket {
  id: number
  trans_code: string
  plant: string
  shift: number
  sample_date: string
  sample_code: number
  net_weight: number
  fat: number
  snf: number
  is_analyse: number
}
