import { injectable } from 'tsyringe'
import type { ResultSetHeader } from 'mysql2'
import { db } from '../../../core/config/database.config'
import type { MilkRejectionSaveDto } from '@shared/dtos/milk-collection/milk-rejection.dto'
import type {
  MilkRejectionRow,
  ReasonRow,
  CountRow,
  PagedMilkRejectionRows
} from './milk-rejection.rows'

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

const SQL_INSERT_REJECTION = `
  INSERT INTO rejection_milk
    (plant, dsk_name, dsk_code, route, supervisor, shift, no_of_canes, aprox_quantity, reason)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

@injectable()
export class MilkRejectionRepo {
  async getReasons(): Promise<ReasonRow[]> {
    const [rows] = await db.execute<ReasonRow[]>(SQL_GET_REASONS)
    return rows
  }

  async getPaginatedMilkRejections(
    search: string | undefined,
    limit: number,
    offset: number
  ): Promise<PagedMilkRejectionRows> {
    let where = ''
    const params: string[] = []

    if (search) {
      where = 'WHERE (dsk_name LIKE ? OR route LIKE ? OR supervisor LIKE ?)'
      const like = `%${search}%`
      params.push(like, like, like)
    }

    const [[countRows], [rows]] = await Promise.all([
      db.query<CountRow[]>(`SELECT COUNT(*) AS total FROM rejection_milk ${where}`, params),
      db.query<MilkRejectionRow[]>(
        `SELECT ${REJECTION_COLUMNS}
           FROM rejection_milk
           ${where}
          ORDER BY id ASC
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
    const [result] = await db.execute<ResultSetHeader>(SQL_INSERT_REJECTION, [
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

    return this.getRejectionMilk(result.insertId)
  }
}
