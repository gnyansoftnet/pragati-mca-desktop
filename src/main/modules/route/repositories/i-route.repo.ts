import { PagedRouteRows, RouteRow } from '../dto/route.rows'

export interface IRouteRepo {
  getRoutes(): Promise<RouteRow[]>
  getPaginatedRoutes(
    search: string | undefined,
    limit: number,
    offset: number
  ): Promise<PagedRouteRows>
}
