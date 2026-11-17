export interface ReasonDto {
  id: number
  reason: string
}

export interface WeightSystemDto {
  id: number
  systemList: string
}

export interface CansTypeDto {
  id: number
  cansType: string
}
export interface ShiftDto {
  id: number
  shiftName: string
  startTime: string
  endTime: string
}
export interface MilkTypesDto {
  id: number
  milkType: string
}
export interface MilkStatusDto {
  id: number
  milkStatus: string
}

export interface DashboardCountDto {
  user: string
  vendor: string
  route: string
  supervisor: string
  collection: string
  analyze: string
  rejected: string
}
