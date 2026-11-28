import { PaginatedResponseDto } from '../pagination.dto'

export interface RejectionMilkReportDto {
  id: number
  rejectionCode: string
  plant: string
  dskName?: string | null
  dskCode: string
  route: string
  routeName?: string | null
  supervisor: string
  supervisorName?: string | null
  shift: string
  shiftName?: string | null
  noOfCanes: string
  aproxQuantity: string
  reason: string
  syncStatus: string
  syncAt: string
  createdAt: string
  updatedAt: string
  dFlag: number
}

export type PaginatedRejectionMilkReportDto = PaginatedResponseDto<RejectionMilkReportDto>
