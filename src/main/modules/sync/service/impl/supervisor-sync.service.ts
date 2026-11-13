import { inject, injectable } from 'tsyringe'
import { Url } from '../../../../core/constants/url'
import { ApiService } from '../../../../utils/api-service'
import { AppError, DatabaseError, ExternalApiError } from '../../../../utils/app-errors'
import { Supervisor, SupervisorListResponse } from '../../dto/supervisor-api-response'
import { ISupervisorSyncService } from '../i-supervisor-sync.service'
import { TOKENS } from '../../../../core/di/token'
import type { ISupervisorSyncRepo } from '../../repo/i-supervisor-sync.repo'
import { SyncSucess } from '@shared/dtos/sync-success.dto'

@injectable()
export class SupervisorSyncService implements ISupervisorSyncService {
  constructor(
    @inject(TOKENS.SupervisorSyncRepo)
    private readonly supervisorRepo: ISupervisorSyncRepo,
    private readonly api: ApiService
  ) {}

  async saveSupervisors(plant: string, org: string, branch: string): Promise<SyncSucess> {
    try {
      const supervisors = await this.syncDownSupervisors(plant, org, branch)
      const row = await this.supervisorRepo.saveSupervisors(supervisors)
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

  async syncDownSupervisors(plant: string, org: string, branch: string): Promise<Supervisor[]> {
    const { data } = await this.api.http.get<SupervisorListResponse>(Url.supervisior, {
      params: {
        orgCode: org,
        branchCode: branch,
        plant: plant
      }
    })

    if (!data.success) {
      throw new ExternalApiError(`Superviosr API failed: ${data.message}`)
    }

    return data.data.map((r): Supervisor => ({
      id: r.id,
      employee_id: r.employee_id,
      first_name: r.first_name,
      last_name: r.last_name,
      contact_no: r.contact_no,
      changed_on: r.changed_on,
      plant: r.plant,
      source_type: r.source_type,
      created_at: r.created_at,
      created_by: r.created_at,
      modified_at: r.modified_at,
      modified_by: r.modified_by,
      branch_code: r.branch_code,
      org_code: r.org_code,
      dFlag: r.dFlag
    }))
  }
}
