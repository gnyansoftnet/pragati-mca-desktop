import { injectable } from 'tsyringe'
import { Url } from '../../../core/constants/url'
import { ApiService } from '../../../utils/api-service'
import { ExternalApiError } from '../../../utils/app-errors'
import { Route, RouteListResponse } from '../dto/route-api-response'

@injectable()
export class RouteSyncService {
  constructor(private readonly api: ApiService) {}

  async syncDownRoutes(plant: string, org: string, branch: string): Promise<Route[]> {
    const { data } = await this.api.http.get<RouteListResponse>(Url.route, {
      params: {
        orgCode: org,
        branchCode: branch,
        plant: plant
      }
    })

    if (!data.success) {
      throw new ExternalApiError(`Route API failed: ${data.message}`)
    }

    return data.data.map((r): Route => ({
      id: r.id,
      plant: r.plant,
      route_code: r.route_code,
      route_name: r.route_name,
      act_date: r.act_date,
      source_type: r.source_type,
      branch_code: r.branch_code,
      org_code: r.org_code,
      dFlag: r.dFlag,
      modified_at: r.modified_at
    }))
  }
}
