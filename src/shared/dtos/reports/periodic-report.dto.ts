export interface ShiftMetricsDto {
  Total_KG: number
  fatavg: number
  snfAvg: number
}
export interface PeriodicReportDto {
  route_code: string
  route_name: string
  morning: ShiftMetricsDto
  evening: ShiftMetricsDto
}