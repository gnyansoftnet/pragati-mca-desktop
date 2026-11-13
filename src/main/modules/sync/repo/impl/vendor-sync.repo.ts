import { injectable } from 'tsyringe'
import { db } from '../../../../core/config/database.config'
import { OperationAction } from '../../../../core/constants/operation-action.enum'
import { DatabaseError } from '../../../../utils/app-errors'
import { Vendor } from '../../dto/vendor-api-response'
import { SyncVendorRow } from '../../../vendor/dto/vendor.rows'
import { IVendorSyncRepo } from '../i-vendor-sync.repo'

@injectable()
export class VendorSyncRepo implements IVendorSyncRepo {
  constructor() {}

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
