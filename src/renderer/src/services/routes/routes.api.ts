import type { Route } from '../../types/routes/routes.types'
import type { PaginatedResponse } from '../../types/common.types'

const routesApi = {
  getAll: (): Promise<Route[]> => {
    return window.api.getRoutes()
  },

  getPaginated: (
    page: number,
    limit: number,
    search: string
  ): Promise<PaginatedResponse<Route>> => {
    return window.api.getPaginatedRoutes({
      page,
      limit,
      search,
    });
  },
};

export default routesApi
