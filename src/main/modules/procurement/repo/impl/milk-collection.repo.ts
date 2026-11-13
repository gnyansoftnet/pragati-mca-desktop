import { injectable } from 'tsyringe'
import { db } from '../../../../core/config/database.config'
import {
  CountRow,
  MilkCollectionPagedRows,
  MilkCollectionRow
} from '../../dto/milk-collection.rows'
import { WeightSystemRow } from '../../dto/weight-system.row'
import { SaveMilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection.dto'
import { ResultSetHeader } from 'mysql2'
import { IMilkCollectionRepo } from '../i-milk-collection.repo'

const SQL_MILK_COLLECTION_COLUMNS = `id, trans_code, plant, user_code, root_code, vendor_code, shift,
  sample_date, sample_code, can_type, weight_system, milk_type, milk_status, tiping_time,
  no_of_cans, gross_weight, net_weight, net_ltr, fat, snf, clr, is_analyse, entry,
  sync_status, sync_date, created_at, updated_at, d_flag`

const USP_M_MILK_COLLECTION_IUD =
  'CALL USP_M_MILK_COLLECTION_IUD(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'

// Weight Sysytem
const SQL_GET_WEIGHT_SYSTEMS = `
  SELECT id, system_list
    FROM weight_system_list
   ORDER BY id ASC`

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

@injectable()
export class MilkCollectionRepo implements IMilkCollectionRepo {
  constructor() {}

  async getMilkCollections(): Promise<MilkCollectionRow[]> {
    const [rows] = await db.query<MilkCollectionRow[]>(
      `SELECT ${SQL_MILK_COLLECTION_COLUMNS}
       FROM milk_collection_details
      WHERE sample_date = CURDATE()
        AND d_flag = 0
      ORDER BY id DESC`
    )
    return rows
  }

  async getPaginatedMilkCollections(
    search: string | undefined,
    limit: number,
    offset: number,
    fromDate?: string,
    toDate?: string
  ): Promise<MilkCollectionPagedRows> {
    let where = 'WHERE d_flag = 0'
    const params: (string | number)[] = []

    // ---- date filter ----
    if (fromDate || toDate) {
      let from = (fromDate ?? toDate) as string
      let to = (toDate ?? fromDate) as string

      if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD.')
      }
      if (from > to) [from, to] = [to, from]

      where += ` AND created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)`
      params.push(from, to)
    } else {
      // default: today's data
      where += ` AND created_at >= CURDATE() AND created_at < CURDATE() + INTERVAL 1 DAY`
    }

    // ---- search filter ----
    if (search) {
      where += ` AND (trans_code LIKE ? OR user_code LIKE ? OR root_code LIKE ? OR vendor_code LIKE ?)`
      const like = `%${search}%`
      params.push(like, like, like, like)
    }

    const [[countRows], [rows]] = await Promise.all([
      db.query<CountRow[]>(
        `SELECT COUNT(*) AS total FROM milk_collection_details ${where}`,
        params
      ),
      db.query<MilkCollectionRow[]>(
        `SELECT ${SQL_MILK_COLLECTION_COLUMNS}
       FROM milk_collection_details
       ${where}
       ORDER BY id ASC
       LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )
    ])

    return { rows, total: Number(countRows[0].total) }
  }

  async saveMilkCollection(data: SaveMilkCollectionDto): Promise<MilkCollectionRow> {
    const [result] = await db.query<MilkCollectionRow[]>(USP_M_MILK_COLLECTION_IUD, [
      'INSERT',
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
    return result[0]
  }

  async getWeightSystems(): Promise<WeightSystemRow[]> {
    const [rows] = await db.execute<WeightSystemRow[]>(SQL_GET_WEIGHT_SYSTEMS)
    return rows
  }

  async saveWeightSystem(systemList: string, userCode: string): Promise<WeightSystemRow> {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO weight_system_list (system_list, user_code)
       VALUES (?, ?) AS new_row
       ON DUPLICATE KEY UPDATE
         user_code = new_row.user_code,
         id = LAST_INSERT_ID(id)`,
      [systemList, userCode]
    )

    const [rows] = await db.execute<WeightSystemRow[]>(
      `SELECT id, system_list, user_code, creation_date, update_date
       FROM weight_system_list
       WHERE id = ?`,
      [result.insertId]
    )

    if (!rows.length) {
      throw new Error('Failed to save weight system')
    }
    return rows[0]
  }
}
