import { PaginatedResponseDto } from '../pagination.dto'

export interface MilkRejectionResponseDto {
  id: number
  plant: string
  dskName: string
  dskCode: string
  route: string
  supervisor: string
  shift: string
  noOfCanes: string
  aproxQuantity: string
  reason: string
  syncStatus?: string
  createdAt?: string
  updatedAt?: string
}

export type PaginatedMilkRejectionDto = PaginatedResponseDto<MilkRejectionResponseDto>

export interface ReasonDto {
  id: number
  reason: string
}

export interface MilkRejectionSaveDto {
  plant: string
  dskName: string
  dskCode: string
  route: string
  supervisor: string
  shift: string
  noOfCanes: string
  aproxQuantity: string
  reason: string
}
