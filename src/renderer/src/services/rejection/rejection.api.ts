import { MilkRejectionResponseDto, MilkRejectionSaveDto, PaginatedMilkRejectionDto, ReasonDto } from '@shared/dtos/milk-rejection/milk-rejection.dto'
import type { PaginatedResponse } from '../../types/common.types'


const rejectionApi = {
  getReasons: (): Promise<ReasonDto[]> => {
    return window.api.getReasons()
  },

    getPaginatedMilkRejections: (
    page: number,
    limit: number,
    search: string
  ): Promise<PaginatedResponse<MilkRejectionResponseDto>> => {
    return window.api.getPaginatedMilkRejections({
      page,
      limit,
      search
    })
  },

  saveMilkRejection: (params: MilkRejectionSaveDto): Promise<MilkRejectionResponseDto> => {
    return window.api.saveMilkRejection(params)
  }

  
}

export default rejectionApi
