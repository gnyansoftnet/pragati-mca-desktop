import { Vendor } from '../dto/vendor-api-response'
import { SyncVendorRow } from '../../vendor/dto/vendor.rows'

export interface IVendorSyncRepo {
  saveVendors(items: Vendor[]): Promise<SyncVendorRow>
}
