import { injectable } from 'tsyringe'
import { db } from '../../../../core/config/database.config'
import { OperationAction } from '../../../../core/constants/operation-action.enum'
import { DatabaseError } from '../../../../utils/app-errors'
import { Route } from '../../dto/route-api-response'
import { SyncRouteRow } from '../../../route/dto/route.rows'
import { IRouteSyncRepo } from '../i-route-sync.repo'

@injectable()
export class RouteSyncRepo implements IRouteSyncRepo {
  constructor() {}
  async saveRoutes(items: Route[]): Promise<SyncRouteRow> {
    const [result] = await db.query<SyncRouteRow[][]>('CALL USP_M_ROUTE_SYNC(?, ?)', [
      OperationAction.SYNCDOWN,
      JSON.stringify(items)
    ])

    const row = result?.[0]?.[0]
    if (!row) throw new DatabaseError('Route sync returned no result')
    if (!row.success) throw new DatabaseError(row.message)
    return row
  }
}
