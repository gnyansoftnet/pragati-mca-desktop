import { SyncSucess } from '@shared/dtos/sync-success.dto'
import { Route } from '../dto/route-api-response'

export interface IRouteSyncService {
  saveRoutes(plant: string, org: string, branch: string): Promise<SyncSucess>
  syncDownRoutes(plant: string, org: string, branch: string): Promise<Route[]>
}
