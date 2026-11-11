import { PaginatedMilkRejectionDto, ReasonDto } from '@shared/dtos/milk-rejection/milk-rejection.dto'
import type { PaginatedResponse } from '../../types/common.types'


const rejectionApi = {
  getReasons: (): Promise<ReasonDto[]> => {
    return window.api.getReasons()
  },

  getPaginatedMilkRejections: (
    page: number,
    limit: number,
    search: string
  ): Promise<PaginatedResponse<PaginatedMilkRejectionDto>> => {
    return window.api.getPaginatedMilkRejections({
      page,
      limit,
      search
    })
  }

  
}

export default rejectionApi
