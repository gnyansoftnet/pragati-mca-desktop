import { injectable } from 'tsyringe'

import { IVendorRepo } from '../i-vendor.repo'
import { db } from '../../../../core/config/database.config'
import { CountRow, PagedVendorRows, VendorListRow, VendorRow } from '../../dto/vendor.rows'

const SQL_VENDOR_COLUMNS = `id, dsk_name, dsk_code, vendor_code, mobile_number, route_code, supervisor_emp_id`

const SQL_VENDOR_COLUMNS_WITH_ROUTE = `
  v.id, v.dsk_name, v.dsk_code, v.vendor_code, v.mobile_number,
  v.route_code, v.supervisor_emp_id,
  r.route_name`
const escapeLike = (value: string): string => value.replace(/[\\%_]/g, '\\$&')

@injectable()
export class VendorRepo implements IVendorRepo {
  constructor() {}

  async getVendors(): Promise<VendorListRow[]> {
    const [rows] = await db.query<VendorListRow[]>(
      `SELECT ${SQL_VENDOR_COLUMNS}
         FROM vendor
        ORDER BY id ASC`
    )
    return rows
  }

  async getVendorsByRoute(routeCode: string): Promise<VendorListRow[]> {
    const [rows] = await db.query<VendorListRow[]>(
      `SELECT ${SQL_VENDOR_COLUMNS}
         FROM vendor
        WHERE route_code = ?
        ORDER BY id ASC`,
      [routeCode]
    )
    return rows
  }

  async getPaginatedVendors(
    search: string | undefined,
    limit: number,
    offset: number
  ): Promise<PagedVendorRows> {
    let where = ''
    const params: (string | number)[] = []

    if (search) {
      where = 'WHERE (v.mobile_number LIKE ? OR v.dsk_name LIKE ? OR v.dsk_code LIKE ?)'
      const like = `%${escapeLike(search)}%`
      params.push(like, like, like)
    }

    const [[countRows], [rows]] = await Promise.all([
      db.query<CountRow[]>(`SELECT COUNT(*) AS total FROM vendor v ${where}`, params),
      db.query<VendorRow[]>(
        `SELECT ${SQL_VENDOR_COLUMNS_WITH_ROUTE}
           FROM vendor v
           LEFT JOIN route r ON r.route_code = v.route_code
           ${where}
          ORDER BY v.id ASC
          LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )
    ])

    return { rows, total: Number(countRows[0].total) }
  }
}
