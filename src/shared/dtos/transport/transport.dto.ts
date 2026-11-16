import { PaginatedResponseDto } from '../pagination.dto'

export interface TransportDto {
  id: number
  transportCode: string
  plant: string
  transportDate: string
  shift: string
  routeCode: string
  routeName?: string | null
  trasporter: string
  vehicleRcNo: string
  driverName: string
  syncDate: string
  syncStatus: string
  createdAt: string
  updatedAt: string
  dFalg: number
}

export type PaginatedTransportDto = PaginatedResponseDto<TransportDto>

export interface TransportSaveDto {
  plant: string
  transportDate: string
  shift: string
  routeCode: string
  trasporter: string
  vehicleRcNo: string
  driverName: string
}
