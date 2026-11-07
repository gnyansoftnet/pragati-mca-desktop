import { injectable } from 'tsyringe'
import { Url } from '../../../core/constants/url'
import { ApiService } from '../../../utils/api-service'
import { ExternalApiError } from '../../../utils/app-errors'
import { Vendor, VendorListResponse } from '../dto/vendor-api-response'

@injectable()
export class VendorSyncService {
  constructor(private readonly api: ApiService) {}

  async syncDownVendors(plant: string, org: string, branch: string): Promise<Vendor[]> {
    const { data } = await this.api.http.get<VendorListResponse>(Url.vendorDetails, {
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
}
