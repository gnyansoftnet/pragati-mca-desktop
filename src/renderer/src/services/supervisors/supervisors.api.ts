// import type { Supervisor } from '../../types/supervisors/supervisors.types'
import type { PaginatedResponse } from '../../types/common.types'
import { SupervisorResponseDto } from '@shared/dtos/supervisor/supervisor.dto'

const supervisorsApi = {
  getAll: (): Promise<SupervisorResponseDto[]> => {
    return window.api.getSupervisors()
  },

  getPaginated: (
    page: number,
    limit: number,
    search: string
  ): Promise<PaginatedResponse<SupervisorResponseDto>> => {
    return window.api.getPaginatedSupervisors({
      page,
      limit,
      search
    })
  },


  syncSupervisors: (plant: string, org: string, branch: string) => {
    return window.api.syncSupervisors(plant, org, branch)
  }
}

export default supervisorsApi
