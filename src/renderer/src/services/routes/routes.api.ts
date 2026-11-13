// import type { Route } from '../../types/routes/routes.types'
import type { PaginatedResponse } from '../../types/common.types'
import { RouteResponseDto } from '@shared/dtos/route/route-response.dto'

const routesApi = {
  getAll: (): Promise<RouteResponseDto[]> => {
    return window.api.getRoutes()
  },

  getPaginated: (
    page: number,
    limit: number,
    search: string
  ): Promise<PaginatedResponse<RouteResponseDto>> => {
    return window.api.getPaginatedRoutes({
      page,
      limit,
      search
    })
  },

  syncRoutes: (plant: string, org: string, branch: string) => {
    return window.api.syncRoutes(plant, org, branch)
  }
}

export default routesApi
