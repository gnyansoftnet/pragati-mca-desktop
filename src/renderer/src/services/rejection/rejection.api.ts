import {
  MilkRejectionResponseDto,
  MilkRejectionSaveDto
} from '@shared/dtos/milk-rejection/milk-rejection.dto'
import type { PaginatedResponse } from '../../types/common.types'
import { ReasonDto } from '@shared/dtos/milk-collection/milk-rejection.dto'

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
