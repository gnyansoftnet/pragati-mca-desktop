import { injectable } from 'tsyringe'
import type { ResultSetHeader } from 'mysql2'
import { db } from '../../../../core/config/database.config'
import type { MilkRejectionSaveDto } from '@shared/dtos/milk-collection/milk-rejection.dto'
import type {
  MilkRejectionRow,
  ReasonRow,
  CountRow,
  PagedMilkRejectionRows
} from '../../dto/milk-rejection.rows'
import { OperationAction } from '../../../../core/constants/operation-action.enum'
import { IMilkRejectionRepo } from '../i-milk-rejection.repo'

const REJECTION_COLUMNS = `id, plant, dsk_name, dsk_code, route, supervisor, shift,
  no_of_canes, aprox_quantity, reason, sync_status, created_at, updated_at`

const SQL_GET_REASONS = `
  SELECT id, reason
    FROM rejection_reason
   ORDER BY id ASC`

const SQL_GET_REJECTION_BY_ID = `
  SELECT ${REJECTION_COLUMNS}
    FROM rejection_milk
   WHERE id = ?`

// const SQL_INSERT_REJECTION = `
//   INSERT INTO rejection_milk
//     (plant, dsk_name, dsk_code, route, supervisor, shift, no_of_canes, aprox_quantity, reason)
//   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

const USP_M_REJECTION_MILK_IUD = 'CALL USP_M_REJECTION_MILK_IUD(?,?,?,?,?,?,?,?,?,?,?)'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

@injectable()
export class MilkRejectionRepo implements IMilkRejectionRepo {
  constructor() {}
  async getReasons(): Promise<ReasonRow[]> {
    const [rows] = await db.execute<ReasonRow[]>(SQL_GET_REASONS)
    return rows
  }

  async getPaginatedMilkRejections(
    search: string | undefined,
    limit: number,
    offset: number,
    fromDate?: string,
    toDate?: string
  ): Promise<PagedMilkRejectionRows> {
    const conditions: string[] = []
    const params: (string | number)[] = []

    // ---- date filter ----
    if (fromDate || toDate) {
      let from = (fromDate ?? toDate) as string
      let to = (toDate ?? fromDate) as string

      if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD.')
      }
      if (from > to) [from, to] = [to, from]

      conditions.push(`rm.created_at >= ? AND rm.created_at < DATE_ADD(?, INTERVAL 1 DAY)`)
      params.push(from, to)
    }

    // ---- search filter ----
    if (search) {
      conditions.push(
        `(rm.dsk_name LIKE ? OR rm.route LIKE ? OR r.route_name LIKE ? OR rm.supervisor LIKE ?)`
      )
      const like = `%${search}%`
      params.push(like, like, like, like)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const [[countRows], [rows]] = await Promise.all([
      db.query<CountRow[]>(
        `SELECT COUNT(*) AS total
           FROM rejection_milk rm
           LEFT JOIN route r ON r.route_code = rm.route
           ${where}`,
        params
      ),
      db.query<MilkRejectionRow[]>(
        `SELECT rm.*,
                r.route_name
           FROM rejection_milk rm
           LEFT JOIN route r ON r.route_code = rm.route
           ${where}
          ORDER BY rm.id ASC
          LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )
    ])

    return { rows, total: Number(countRows[0].total) }
  }

  async getRejectionMilk(id: number): Promise<MilkRejectionRow | undefined> {
    const [rows] = await db.execute<MilkRejectionRow[]>(SQL_GET_REJECTION_BY_ID, [id])
    return rows[0]
  }

  async saveMilkRejection(data: MilkRejectionSaveDto): Promise<MilkRejectionRow | undefined> {
    const [result] = await db.execute<ResultSetHeader>(USP_M_REJECTION_MILK_IUD, [
      OperationAction.INSERT,
      null,
      data.plant,
      data.dskName,
      data.dskCode,
      data.route,
      data.supervisor,
      data.shift,
      data.noOfCanes,
      data.aproxQuantity,
      data.reason
    ])

    return result[0][0]
  }
}
