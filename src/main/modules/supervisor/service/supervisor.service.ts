import { injectable, inject } from 'tsyringe'
import { SupervisorRepo } from '../repo/supervisor.repo'
import type { PaginationRequestDto } from '@shared/dtos/pagination.dto'
import type {
  PaginatedSupervisorDto,
  SupervisorResponseDto
} from '@shared/dtos/supervisor/supervisor.dto'
import { AppError, DatabaseError } from '../../../utils/app-errors'
import { SupervisorSyncService } from './supervisor-sync.service'
import { SyncSupervisor } from '../repo/supervisor.rows'
import { SyncSucess } from '@shared/dtos/sync-success.dto'

@injectable()
export class SupervisorService {
  constructor(
    @inject(SupervisorRepo) private readonly supervisorRepo: SupervisorRepo,
    @inject(SupervisorSyncService) private readonly supervisorApi: SupervisorSyncService
  ) {}

  async getSupervisors(): Promise<SupervisorResponseDto[]> {
    try {
      const rows = await this.supervisorRepo.getSupervisors()
      return rows.map((r) => ({
        id: r.id,
        empId: r.employee_id,
        firstName: r.first_name,
        lastName: r.last_name,
        plant: r.plant,
        contactNo: r.contact_no
      }))
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch supervisors', { cause: error })
    }
  }

  async getPaginatedSupervisors(data: PaginationRequestDto): Promise<PaginatedSupervisorDto> {
    const page = Math.max(1, Math.trunc(Number(data.page)) || 1)
    const limit = Math.max(1, Math.trunc(Number(data.limit)) || 10)
    const offset = (page - 1) * limit
    const search = data.search?.trim() || undefined

    try {
      const { rows, total } = await this.supervisorRepo.getPaginatedSupervisors(
        search,
        limit,
        offset
      )
      const totalPages = Math.ceil(total / limit)

      return {
        data: rows.map((r) => ({
          id: r.id,
          empId: r.emp_id,
          firstName: r.first_name,
          lastName: r.last_name,
          plant: r.plant,
          contactNo: r.contact_no
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch supervisors', { cause: error })
    }
  }

  async saveSupervisor(plant: string, org: string, branch: string): Promise<SyncSucess> {
    try {
      const supervisors = await this.supervisorApi.syncDownSupervisor(plant, org, branch)
      const row = await this.supervisorRepo.saveSupervisor(supervisors)
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
