import { injectable } from 'tsyringe'
import type { RowDataPacket } from 'mysql2'
import { db } from '../../../../core/config/database.config'
import type { MilkRejectionSaveDto } from '@shared/dtos/milk-collection/milk-rejection.dto'
import type {
  MilkRejectionRow,
  CountRow,
  PagedMilkRejectionRows
} from '../../dto/milk-rejection.rows'
import { OperationAction } from '../../../../core/constants/operation-action.enum'
import { IMilkRejectionRepo } from '../i-milk-rejection.repo'
import {
  AppError,
  DatabaseError,
  NotFoundError,
  ValidationError
} from '../../../../utils/app-errors'

const REJECTION_COLUMNS = `id, plant, dsk_name, dsk_code, route, supervisor, shift,
  no_of_canes, aprox_quantity, reason, sync_status, created_at, updated_at`

const SQL_GET_REJECTION_BY_ID = `
  SELECT ${REJECTION_COLUMNS}
    FROM rejection_milk
   WHERE id = ?`

const USP_M_REJECTION_MILK_IUD = 'CALL USP_M_REJECTION_MILK_IUD(?,?,?,?,?,?,?,?,?,?,?)'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

@injectable()
export class MilkRejectionRepo implements IMilkRejectionRepo {
  constructor() {}

  async getPaginatedMilkRejections(
    search: string | undefined,
    limit: number,
    offset: number,
    shift?: string | number,
    date?: string
  ): Promise<PagedMilkRejectionRows> {
    const conditions: string[] = ['rm.d_flag = 0']
    const params: (string | number)[] = []
    // ---- 1. Single Date Filter (Optional) ----
    if (date && date.trim() !== '') {
      if (!DATE_RE.test(date)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD.')
      }
      conditions.push(`rm.created_at >= ? AND rm.created_at < DATE_ADD(?, INTERVAL 1 DAY)`)
      params.push(date, date)
    }
    // If date is omitted, no date filter is applied -> returns all dates
    // ---- 2. Shift Filter (Optional) ----
    if (
      shift !== undefined &&
      shift !== null &&
      String(shift).trim() !== '' &&
      String(shift) !== '0'
    ) {
      conditions.push(`rm.shift = ?`)
      params.push(String(shift).trim())
    }
    // If shift is omitted or '0', no shift filter is applied -> returns all shifts
    // ---- 3. Search Filter (Optional) ----
    if (search && search.trim() !== '') {
      conditions.push(
        `(rm.dsk_name LIKE ? OR rm.route LIKE ? OR r.route_name LIKE ? OR rm.supervisor LIKE ?)`
      )
      const like = `%${search.trim()}%`
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
              r.route_name,
              sh.shift_name
       FROM rejection_milk rm
       LEFT JOIN route r  ON r.route_code = rm.route
       LEFT JOIN shift sh ON sh.id = rm.shift
       ${where}
       ORDER BY rm.id ASC
       LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )
    ])
    return { rows, total: Number(countRows[0]?.total ?? 0) }
  }

  async getRejectionMilk(id: number): Promise<MilkRejectionRow | undefined> {
    const [rows] = await db.execute<MilkRejectionRow[]>(SQL_GET_REJECTION_BY_ID, [id])
    return rows[0]
  }

  async saveMilkRejection(data: MilkRejectionSaveDto): Promise<MilkRejectionRow> {
    try {
      const params = [
        OperationAction.INSERT,
        null,
        data.plant,
        data.dskName,
        data.dskCode,
        data.route,
        data.supervisor,
        data.shift,
        data.noOfCanes ?? 0,
        data.aproxQuantity ?? 0,
        data.reason || ''
      ]
      const [rows] = await db.query<RowDataPacket[][]>(USP_M_REJECTION_MILK_IUD, params)
      const insertedRow = rows?.[0]?.[0]
      if (!insertedRow) {
        throw new NotFoundError('Milk rejection saved but returned row was not found')
      }
      return insertedRow as unknown as MilkRejectionRow
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error
      }
      if (error?.sqlState === '45000' || error?.errno === 1644) {
        throw new ValidationError(error.sqlMessage || error.message || 'Validation failed')
      }

      if (error?.errno === 1062) {
        throw new ValidationError('A rejection record already exists for this entry', {
          cause: error
        })
      }
      const message = error?.sqlMessage || error?.message || 'Failed to save milk rejection'
      throw new DatabaseError(message, { cause: error })
    }
  }
}
