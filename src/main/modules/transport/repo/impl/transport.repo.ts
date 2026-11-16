import { TransportSaveDto } from '@shared/dtos/transport/transport.dto'
import { ITransportRepo } from '../i-transport.repo'
import { CountRow, PagedTransportRows, TransportRow } from '../../dto/transport.row'
import { ResultSetHeader } from 'mysql2'
import { OperationAction } from '../../../../core/constants/operation-action.enum'
import { db } from '../../../../core/config/database.config'
import { injectable } from 'tsyringe'

const USP_M_TRANSPORT_IUD = 'CALL USP_M_TRANSPORT_IUD(?,?,?,?,?,?,?,?,?)'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

@injectable()
export class TransportRepo implements ITransportRepo {
  constructor() {}

  async getPaginatedTransports(
    search: string | undefined,
    limit: number,
    offset: number,
    fromDate?: string,
    toDate?: string
  ): Promise<PagedTransportRows> {
    const conditions: string[] = []
    const params: (string | number)[] = []

    // Date filter
    if (fromDate || toDate) {
      let from = (fromDate ?? toDate) as string
      let to = (toDate ?? fromDate) as string

      if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD.')
      }

      if (from > to) {
        ;[from, to] = [to, from]
      }

      conditions.push('tr.transport_date >= ? AND tr.transport_date < DATE_ADD(?, INTERVAL 1 DAY)')

      params.push(from, to)
    }

    // Search filter
    if (search) {
      conditions.push(
        `(
          tr.trasporter LIKE ?
          OR tr.vehicle_rc_no LIKE ?
          OR tr.driver_name LIKE ?
          OR tr.plant LIKE ?
          OR tr.route_code LIKE ?
          OR r.route_name LIKE ?
        )`
      )

      const like = `%${search}%`
      params.push(like, like, like, like, like, like)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    // Count query
    const [[countRows], [rows]] = await Promise.all([
      db.query<CountRow[]>(
        `SELECT COUNT(*) AS total
         FROM transport_details tr
         LEFT JOIN route r ON r.route_code = tr.route_code
         ${where}`,
        params
      ),

      // Paginated data query
      db.query<TransportRow[]>(
        `SELECT
            tr.*,
            r.route_name
         FROM transport_details tr
         LEFT JOIN route r ON r.route_code = tr.route_code
         ${where}
         ORDER BY tr.id ASC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )
    ])

    return {
      rows,
      total: Number(countRows[0]?.total ?? 0)
    }
  }

  async saveTransport(data: TransportSaveDto): Promise<TransportRow> {
    const [result] = await db.execute<ResultSetHeader>(USP_M_TRANSPORT_IUD, [
      OperationAction.INSERT,
      null,
      data.plant,
      data.transportDate,
      data.shift,
      data.routeCode,
      data.trasporter,
      data.vehicleRcNo,
      data.driverName
    ])

    const row = result[0]?.[0]

    if (!row) {
      throw new Error('Transport saved but returned row was not found.')
    }
    return row
  }
}
