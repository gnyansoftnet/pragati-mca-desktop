import { SyncSucess } from '@shared/dtos/sync-success.dto'
import { Route, RouteListResponse } from '../../dto/route-api-response'
import { IRouteSyncService } from '../i-route-sync.service'
import { AppError, DatabaseError, ExternalApiError } from '../../../../utils/app-errors'
import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../../../core/di/token'
import type { IRouteSyncRepo } from '../../repo/i-route-sync.repo'
import { ApiService } from '../../../../utils/api-service'
import { Url } from '../../../../core/constants/url'

@injectable()
export class RouteSyncService implements IRouteSyncService {
  constructor(
    @inject(TOKENS.RouteSyncRepo)
    private readonly routeSyncRepo: IRouteSyncRepo,
    private readonly api: ApiService
  ) {}
  async saveRoutes(plant: string, org: string, branch: string): Promise<SyncSucess> {
    try {
      const routes = await this.syncDownRoutes(plant, org, branch)
      if (routes.length == 0) {
        throw new ExternalApiError('no route found')
      }
      const row = await this.routeSyncRepo.saveRoutes(routes)
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
