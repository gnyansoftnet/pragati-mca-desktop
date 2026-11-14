import { SyncSucess } from '@shared/dtos/sync-success.dto'
import { IVendorSyncService } from '../i-vendor-sync.service'
import { inject, injectable } from 'tsyringe'
import { Vendor, VendorListResponse } from '../../dto/vendor-api-response'
import { ApiService } from '../../../../utils/api-service'
import { Url } from '../../../../core/constants/url'
import { AppError, DatabaseError, ExternalApiError } from '../../../../utils/app-errors'
import { TOKENS } from '../../../../core/di/token'
import type { IVendorSyncRepo } from '../../repo/i-vendor-sync.repo'

@injectable()
export class VendorSyncService implements IVendorSyncService {
  constructor(
    @inject(TOKENS.VendorSyncRepo)
    private readonly vendoSyncRepo: IVendorSyncRepo,
    private readonly api: ApiService
  ) {}

  async syncDownVendors(plant: string, org: string, branch: string): Promise<Vendor[]> {
    const { data } = await this.api.http.get<VendorListResponse>(Url.vendor, {
      params: {
        orgCode: org,
        branchCode: branch,
        plant: plant
      }
    })

    if (!data.success) {
      throw new ExternalApiError(`Vendor API failed: ${data.message}`)
    }

    return data.data.map((r): Vendor => ({
      id: r.id,
      plant: r.plant,
      dsk_code: r.dsk_code,
      dsk_name: r.dsk_name,
      vendor: r.vendor,
      mobile_no: r.mobile_no,
      date: r.date,
      route_code: r.route_code,
      supervisor_emp_id: r.supervisor_emp_id,
      source_type: r.source_type,
      created_at: r.created_at,
      created_by: r.created_by,
      modified_at: r.modified_at,
      modified_by: r.modified_by,
      branch_code: r.branch_code,
      org_code: r.org_code,
      dFlag: r.dFlag
    }))
  }

  async saveVendors(plant: string, org: string, branch: string): Promise<SyncSucess> {
    try {
      const vendors = await this.syncDownVendors(plant, org, branch)
      if (vendors.length == 0) {
        throw new ExternalApiError('no vendor found')
      }
      const row = await this.vendoSyncRepo.saveVendors(vendors)
      return {
        success: Number(row.success),
        message: row.message,
        total: Number(row.total)
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to save routes', { cause: error })
    }
  }
}
