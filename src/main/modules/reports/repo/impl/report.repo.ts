import { injectable } from 'tsyringe'
import { db } from '../../../../core/config/database.config'
import { CountRow, TruckSheetPagedRows, TruckSheetRow } from '../../dto/truck-sheet.row'
import { IReportRepo } from '../i-report.repo'
import { PeriodicReportRow } from '../../dto/periodic-report.row'
import { RejectionReportPagedRows, RejectionReportRow } from '../../dto/rejection-report.row'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

@injectable()
export class ReportRepo implements IReportRepo {
  constructor() {}

  async getPeriodicReport(fromDate: string, toDate: string): Promise<PeriodicReportRow[]> {
    if (!DATE_RE.test(fromDate) || !DATE_RE.test(toDate)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD.')
    }
    const sql = `
      SELECT 
        m.root_code AS route_code,
        COALESCE(r.route_name, m.root_code) AS route_name,
        -- ================= MORNING (shift = 1) =================
        COALESCE(SUM(CASE WHEN m.shift = 1 THEN m.net_weight ELSE 0 END), 0) AS morning_total_kg,
        COALESCE(
          SUM(CASE WHEN m.shift = 1 THEN m.net_weight * m.fat ELSE 0 END) 
          / NULLIF(SUM(CASE WHEN m.shift = 1 THEN m.net_weight ELSE 0 END), 0),
          0
        ) AS morning_fat_avg,
        COALESCE(
          SUM(CASE WHEN m.shift = 1 THEN m.net_weight * m.snf ELSE 0 END) 
          / NULLIF(SUM(CASE WHEN m.shift = 1 THEN m.net_weight ELSE 0 END), 0),
          0
        ) AS morning_snf_avg,
        -- ================= EVENING (shift = 2) =================
        COALESCE(SUM(CASE WHEN m.shift = 2 THEN m.net_weight ELSE 0 END), 0) AS evening_total_kg,
        COALESCE(
          SUM(CASE WHEN m.shift = 2 THEN m.net_weight * m.fat ELSE 0 END) 
          / NULLIF(SUM(CASE WHEN m.shift = 2 THEN m.net_weight ELSE 0 END), 0),
          0
        ) AS evening_fat_avg,
        COALESCE(
          SUM(CASE WHEN m.shift = 2 THEN m.net_weight * m.snf ELSE 0 END) 
          / NULLIF(SUM(CASE WHEN m.shift = 2 THEN m.net_weight ELSE 0 END), 0),
          0
        ) AS evening_snf_avg
      FROM milk_collection_details m
      LEFT JOIN route r ON r.route_code = m.root_code
      WHERE m.d_flag = 0
        AND m.sample_date BETWEEN ? AND ?
      GROUP BY m.root_code, r.route_name
      ORDER BY m.root_code ASC
    `
    const [rows] = await db.query<PeriodicReportRow[]>(sql, [fromDate, toDate])
    return rows
  }

  async getRejectionReport(
    search: string | undefined,
    limit: number,
    offset: number,
    shift?: number,
    date?: string,
    routeCode?: string,
    vendorCode?: string
  ): Promise<RejectionReportPagedRows> {
    let where = 'WHERE rm.d_flag = 0'
    const params: (string | number)[] = []

    if (date && date.trim() !== '') {
      if (!DATE_RE.test(date)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD.')
      }
      where += ` AND rm.created_at = ?`
      params.push(date)
    }
    if (shift !== undefined && shift !== null && shift > 0) {
      where += ` AND rm.shift = ?`
      params.push(shift)
    }
    if (routeCode !== undefined && routeCode !== null) {
      where += ` AND rm.route = ?`
      params.push(routeCode)
    }
    if (vendorCode !== undefined && vendorCode !== null) {
      where += ` AND rm.dsk_code = ?`
      params.push(vendorCode)
    }

    if (search && search.trim() !== '') {
      where += ` AND (rm.rejection_code LIKE ? OR rm.dsk_name LIKE ? OR rm.route LIKE ? OR rm.dsk_code LIKE ?)`
      const like = `%${search.trim()}%`
      params.push(like, like, like, like)
    }
    const [[countRows], [rows]] = await Promise.all([
      db.query<CountRow[]>(
        `SELECT COUNT(*) AS total
          FROM rejection_milk rm
          ${where}`,
        params
      ),
      db.query<RejectionReportRow[]>(
        `SELECT rm.*,
                 r.route_name,
                 v.dsk_name,
                 sh.shift_name
          FROM rejection_milk rm
          LEFT JOIN route r        ON r.route_code = rm.route
          LEFT JOIN vendor v       ON v.dsk_code   = rm.dsk_code
          LEFT JOIN shift sh       ON sh.id        = rm.shift
          ${where}
          ORDER BY rm.id ASC
          LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )
    ])
    return { rows, total: Number(countRows[0]?.total ?? 0) }
  }

  async getTruckSheetReport(
    search: string | undefined,
    limit: number,
    offset: number,
    shift?: number,
    date?: string,
    isAnalyse?: number,
    routeCode?: string,
    vendorCode?: string
  ): Promise<TruckSheetPagedRows> {
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
    if (routeCode !== undefined && routeCode !== null) {
      where += ` AND m.root_code = ?`
      params.push(routeCode)
    }
    if (vendorCode !== undefined && vendorCode !== null) {
      where += ` AND m.vendor_code = ?`
      params.push(vendorCode)
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
      db.query<TruckSheetRow[]>(
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
}
