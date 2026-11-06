import { PaginatedResponseDto } from '../pagination.dto'

export interface VendoreResponseDto {
  id: number
  dskName: string
  dskCode: string
  vendorCode: string
  mobileNumber?: string | null
  routeCode?: string | null
  supervisorEmpId?: string | null
}

export type PaginatedVendorsDto = PaginatedResponseDto<VendoreResponseDto>
