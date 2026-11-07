import { injectable } from 'tsyringe'
import { db } from '../../../core/config/database.config'
import type { RowDataPacket } from 'mysql2'
import type {
  VendorRow,
  VendorListRow,
  CountRow,
  PagedVendorRows,
  SyncVendorRow
} from './vendor.rows'
import { OperationAction } from '../../../core/constants/operation-action.enum'
import { Vendor } from '../dto/vendor-api-response'
import { DatabaseError } from '../../../utils/app-errors'

const SQL_GET_VENDORS = `
  SELECT id, dsk_code, dsk_name, vendor_code
    FROM vendor
   ORDER BY id ASC`

const SQL_VENDOR_COLUMNS = `id, dsk_name, dsk_code, vendor_code, mobile_number, route_code, supervisor_emp_id`

@injectable()
export class VendorRepo {
  async getVendors(): Promise<(VendorListRow & RowDataPacket)[]> {
    const [rows] = await db.execute<(VendorListRow & RowDataPacket)[]>(SQL_GET_VENDORS)
    return rows
  }

  async getPaginatedVendors(
    search: string | undefined,
    limit: number,
    offset: number
  ): Promise<PagedVendorRows> {
    let where = ''
    const params: string[] = []

    if (search) {
      where = 'WHERE (mobile_number LIKE ? OR dsk_name LIKE ? OR dsk_code LIKE ?)'
      const like = `%${search}%`
      params.push(like, like, like)
    }

    const [[countRows], [rows]] = await Promise.all([
      db.query<CountRow[]>(`SELECT COUNT(*) AS total FROM vendor ${where}`, params),
      db.query<VendorRow[]>(
        `SELECT ${SQL_VENDOR_COLUMNS}
           FROM vendor
           ${where}
          ORDER BY id ASC
          LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )
    ])

    return { rows, total: Number(countRows[0].total) }
  }

  async saveVendors(items: Vendor[]): Promise<SyncVendorRow> {
    const [result] = await db.query<SyncVendorRow[][]>('CALL USP_M_VENDOR_SYNC(?, ?)', [
      OperationAction.SYNCDOWN,
      JSON.stringify(items)
    ])

    const row = result?.[0]?.[0]
    if (!row) throw new DatabaseError('Vendor sync returned no result')
    if (!row.success) throw new DatabaseError(row.message)
    return row
  }
}
