import { injectable } from 'tsyringe'
import { db } from '../../../core/config/database.config'
import { CountRow, PagedRouteRows, RouteRow, SyncRouteRow } from './route.rows'
import { Route } from '../dto/route-api-response'
import { DatabaseError } from '../../../utils/app-errors'
import { OperationAction } from '../../../core/constants/operation-action.enum'

const SQL_GET_ROUTES = `
  SELECT id, route_name, route_code
    FROM route
   ORDER BY id ASC`

@injectable()
export class RouteRepo {
  async getRoutes(): Promise<RouteRow[]> {
    const [rows] = await db.execute<RouteRow[]>(SQL_GET_ROUTES)
    return rows
  }

  async getPaginatedRoutes(
    search: string | undefined,
    limit: number,
    offset: number
  ): Promise<PagedRouteRows> {
    let where = ''
    const params: string[] = []

    if (search) {
      where = 'WHERE (route_name LIKE ? OR route_code LIKE ?)'
      const like = `%${search}%`
      params.push(like, like)
    }

    const [[countRows], [rows]] = await Promise.all([
      db.query<CountRow[]>(`SELECT COUNT(*) AS total FROM route ${where}`, params),
      db.query<RouteRow[]>(
        `SELECT id, route_name, route_code
           FROM route
           ${where}
          ORDER BY id ASC
          LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )
    ])

    return { rows, total: Number(countRows[0].total) }
  }

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
