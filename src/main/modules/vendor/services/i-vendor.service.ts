import { PaginationRequestDto } from '@shared/dtos/pagination.dto'
import { PaginatedVendorsDto, VendoreResponseDto } from '@shared/dtos/vendor/vendor.dto'

export interface IVendorService {
  getVendors(): Promise<VendoreResponseDto[]>
  getVendorsByRoute(routeCode: string): Promise<VendoreResponseDto[]>
  getPaginatedVendors(data: PaginationRequestDto): Promise<PaginatedVendorsDto>
}
