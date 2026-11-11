import type { Supervisor } from '../../types/supervisors/supervisors.types'
import type { PaginatedResponse } from '../../types/common.types'

const supervisorsApi = {
  getAll: (): Promise<Supervisor[]> => {
    return window.api.getSupervisors()
  },

  getPaginated: (
    page: number,
    limit: number,
    search: string
  ): Promise<PaginatedResponse<Supervisor>> => {
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
