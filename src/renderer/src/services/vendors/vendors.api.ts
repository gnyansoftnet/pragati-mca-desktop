// import type { Vendor } from '../../types/vendors/vendors.types'
import type { PaginatedResponse } from '../../types/common.types'
import { VendoreResponseDto } from '@shared/dtos/vendor/vendor.dto'

const vendorsApi = {
  getAll: (): Promise<VendoreResponseDto[]> => {
    return window.api.getVendors() as unknown as Promise<VendoreResponseDto[]>
  },

  getPaginated: (
    page: number,
    limit: number,
    search: string
  ): Promise<PaginatedResponse<VendoreResponseDto>> => {
    return window.api.getPaginatedVendors({
      page,
      limit,
      search
    }) as unknown as Promise<PaginatedResponse<VendoreResponseDto>>
  },

  syncVendors: (plant: string, org: string, branch: string) => {
    return window.api.syncVendors(plant, org, branch)
  }
}

export default vendorsApi