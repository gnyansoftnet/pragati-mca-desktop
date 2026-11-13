import { SyncSucess } from '@shared/dtos/sync-success.dto'
import { Vendor } from '../dto/vendor-api-response'

export interface IVendorSyncService {
  syncDownVendors(plant: string, org: string, branch: string): Promise<Vendor[]>
  saveVendors(plant: string, org: string, branch: string): Promise<SyncSucess>
}
