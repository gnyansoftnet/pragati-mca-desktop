import { MilkCollectionRow } from '../../procurement/dto/milk-collection.rows'

export interface MilkCollectionSyncResultDto {
  success: number
  message: string
  total: number
  inserted: number
  updated: number
  rejected: number
  rejected_rows: any[]
}

export interface MilkCollectionSave {
  trans_code: string
  plant: string
  user_code: string
  root_code: string
  vendor_code: string
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
}
export type MilkCollectionSyncRequestDto = MilkCollectionSave[]

const toDateStr = (d: Date | string): string => {
  if (typeof d === 'string') return d.slice(0, 10)
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const toMilkCollectionSave = (row: MilkCollectionRow): MilkCollectionSave => ({
  trans_code: row.trans_code,
  plant: row.plant,
  user_code: row.user_code,
  root_code: row.root_code,
  vendor_code: row.vendor_code,
  shift: Number(row.shift),
  sample_date: toDateStr(row.sample_date as unknown as Date | string),
  sample_code: Number(row.sample_code),
  can_type: row.can_type,
  weight_system: row.weight_system,
  milk_type: row.milk_type,
  milk_status: row.milk_status,
  tiping_time: row.tiping_time,
  no_of_cans: Number(row.no_of_cans),
  gross_weight: Number(row.gross_weight),
  net_weight: Number(row.net_weight),
  net_ltr: Number(row.net_ltr),
  fat: Number(row.fat),
  snf: Number(row.snf),
  clr: Number(row.clr),
  is_analyse: Number(row.is_analyse),
  entry: row.entry
})
