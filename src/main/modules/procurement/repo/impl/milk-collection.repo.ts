import { injectable } from 'tsyringe'
import { db } from '../../../../core/config/database.config'
import {
  CountRow,
  MilkCollectionPagedRows,
  MilkCollectionRow
} from '../../dto/milk-collection.rows'
import { SaveMilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection.dto'

import { IMilkCollectionRepo } from '../i-milk-collection.repo'
import { RowDataPacket } from 'mysql2'
import {
  AppError,
  DatabaseError,
  NotFoundError,
  ValidationError
} from '../../../../utils/app-errors'
import { OperationAction } from '../../../../core/constants/operation-action.enum'

const USP_M_MILK_COLLECTION_IUD =
  'CALL USP_M_MILK_COLLECTION_IUD(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

@injectable()
export class MilkCollectionRepo implements IMilkCollectionRepo {
  constructor() {}

  async getMilkCollections(date: string, shift: number): Promise<MilkCollectionRow[]> {
    // 1. Mandatory validations
    if (!date || !DATE_RE.test(date)) {
      throw new Error('Valid date is required. Use format YYYY-MM-DD.')
    }
    if (shift === undefined || shift === null || Number(shift) <= 0) {
      throw new Error('Valid shift is required.')
    }
    // 2. Query with dynamic date and shift
    const [rows] = await db.query<MilkCollectionRow[]>(
      `SELECT m.*,
            r.route_name,
            v.dsk_name,
            sh.shift_name,
            ms.milk_status AS milk_status_name,
            mt.milk_type AS milk_type_name
     FROM milk_collection_details m
     LEFT JOIN route r        ON r.route_code = m.root_code
     LEFT JOIN vendor v       ON v.dsk_code   = m.vendor_code
     LEFT JOIN shift sh       ON sh.id        = m.shift
     LEFT JOIN milk_status ms ON ms.id        = m.milk_status
     LEFT JOIN milk_type mt   ON mt.id        = m.milk_type
     WHERE m.sample_date = ?
       AND m.shift = ?
       AND m.is_analyse=0
       AND m.d_flag = 0
     ORDER BY m.id DESC`,
      [date, shift]
    )
    return rows
  }

  async getPaginatedMilkCollections(
    search: string | undefined,
    limit: number,
    offset: number,
    shift?: number,
    date?: string,
    isAnalyse?: number
  ): Promise<MilkCollectionPagedRows> {
    let where = 'WHERE m.d_flag = 0'
    const params: (string | number)[] = []

    if (date && date.trim() !== '') {
      if (!DATE_RE.test(date)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD.')
      }
      where += ` AND m.sample_date = ?`
      params.push(date)
    }
    if (shift !== undefined && shift !== null && shift > 0) {
      where += ` AND m.shift = ?`
      params.push(shift)
    }
    if (isAnalyse !== undefined && isAnalyse !== null) {
      where += ` AND m.is_analyse = ?`
      params.push(Number(isAnalyse) === 1 ? 1 : 0)
    }
    if (search && search.trim() !== '') {
      where += ` AND (m.trans_code LIKE ? OR m.user_code LIKE ? OR m.root_code LIKE ? OR m.vendor_code LIKE ?)`
      const like = `%${search.trim()}%`
      params.push(like, like, like, like)
    }
    const [[countRows], [rows]] = await Promise.all([
      db.query<CountRow[]>(
        `SELECT COUNT(*) AS total
       FROM milk_collection_details m
       ${where}`,
        params
      ),
      db.query<MilkCollectionRow[]>(
        `SELECT m.*,
              r.route_name,
              v.dsk_name,
              sh.shift_name,
              ms.milk_status AS milk_status_name,
              mt.milk_type AS milk_type_name
       FROM milk_collection_details m
       LEFT JOIN route r        ON r.route_code = m.root_code
       LEFT JOIN vendor v       ON v.dsk_code   = m.vendor_code
       LEFT JOIN milk_status ms ON ms.id        = m.milk_status
       LEFT JOIN milk_type mt   ON mt.id        = m.milk_type
       LEFT JOIN shift sh       ON sh.id        = m.shift
       ${where}
       ORDER BY m.id ASC
       LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )
    ])
    return { rows, total: Number(countRows[0]?.total ?? 0) }
  }

  async saveMilkCollection(data: SaveMilkCollectionDto): Promise<MilkCollectionRow> {
    try {
      const [rows] = await db.query<RowDataPacket[][]>(USP_M_MILK_COLLECTION_IUD, [
        OperationAction.INSERT,
        null,
        data.plant,
        data.userCode,
        data.rootCode,
        data.vendorCode,
        data.shift,
        data.canType,
        data.weightSystem,
        data.milkType,
        data.milkStatus,
        data.tipingTime,
        data.noOfCans,
        data.grossWeight,
        data.netWeight,
        data.netLtr,
        data.fat,
        data.snf,
        data.clr,
        data.entry
      ])
      const insertedRow = rows?.[0]?.[0]
      if (!insertedRow) {
        throw new NotFoundError('Milk collection saved but returned row not found')
      }
      return insertedRow as unknown as MilkCollectionRow
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error
      }
      if (error.sqlState === '45000') {
        throw new ValidationError(error.sqlMessage || 'Validation failed', { cause: error })
      }

      if (error.errno === 1062) {
        throw new ValidationError('This vendor is already entered for this date and shift', {
          cause: error
        })
      }
      throw new DatabaseError('Failed to execute milk collection query', { cause: error })
    }
  }
}
