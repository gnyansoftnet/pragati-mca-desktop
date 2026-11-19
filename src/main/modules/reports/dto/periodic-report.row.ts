// src/core/dto/periodic-report.row.ts
import { RowDataPacket } from 'mysql2/promise'

export interface PeriodicReportRow extends RowDataPacket {
  route_code: string
  route_name: string | null
  morning_total_kg: number
  morning_fat_avg: number
  morning_snf_avg: number
  evening_total_kg: number
  evening_fat_avg: number
  evening_snf_avg: number
}
