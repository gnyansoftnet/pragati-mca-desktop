import { injectable } from 'tsyringe'
import { db } from '../../../../core/config/database.config'
import { CountRow, PagedRouteRows, RouteRow } from '../../dto/route.rows'
import { IRouteRepo } from '../i-route.repo'

const SQL_GET_ROUTES = `
  SELECT id, route_name, route_code
    FROM route
   ORDER BY id ASC`

@injectable()
export class RouteRepo implements IRouteRepo {
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
}
