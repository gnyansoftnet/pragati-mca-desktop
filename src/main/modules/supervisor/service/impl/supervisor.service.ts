import { injectable, inject } from 'tsyringe'
import type { PaginationRequestDto } from '@shared/dtos/pagination.dto'
import type {
  PaginatedSupervisorDto,
  SupervisorResponseDto
} from '@shared/dtos/supervisor/supervisor.dto'
import { AppError, DatabaseError } from '../../../../utils/app-errors'
import { TOKENS } from '../../../../core/di/token'
import type { ISupervisorRepo } from '../../repo/i-supervisor.repo'
import { ISupervisorService } from '../i-supervisor.service'

@injectable()
export class SupervisorService implements ISupervisorService {
  constructor(@inject(TOKENS.SupervisorRepo) private readonly supervisorRepo: ISupervisorRepo) {}

  async getSupervisors(): Promise<SupervisorResponseDto[]> {
    try {
      const rows = await this.supervisorRepo.getSupervisors()
      return rows.map((r) => ({
        id: r.id,
        employeeId: r.employee_id,
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
          employeeId: r.employee_id,
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
}
