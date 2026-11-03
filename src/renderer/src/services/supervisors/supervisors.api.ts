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
      search,
    });
  },
};

export default supervisorsApi
