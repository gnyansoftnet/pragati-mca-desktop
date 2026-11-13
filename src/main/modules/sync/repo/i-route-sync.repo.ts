import { Route } from '../dto/route-api-response'
import { SyncRouteRow } from '../../route/dto/route.rows'

export interface IRouteSyncRepo {
  saveRoutes(items: Route[]): Promise<SyncRouteRow>
}
