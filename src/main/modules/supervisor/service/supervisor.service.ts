import { injectable, inject } from 'tsyringe'

import { PaginationRequestDto } from '../../../utils/pagination.dto'
import { SupervisorRepo } from '../repo/supervisor.repo'
import { PaginatedSupervisorDto, SupervisorResponseDto } from '../dto/supervisor.dto'

@injectable()
export class SupervisorService {
  constructor(
    @inject(SupervisorRepo)
    private readonly supervisorRepo: SupervisorRepo
  ) {}

  async getSupervisors(): Promise<SupervisorResponseDto[]> {
    return await this.supervisorRepo.getSupervisors()
  }

  async getPaginatedSupervisors(data: PaginationRequestDto): Promise<PaginatedSupervisorDto> {
    if (data.page <= 0) throw new Error('Page must be greater than 0')
    if (data.limit <= 0) throw new Error('Limit must be greater than 0')
    return await this.supervisorRepo.getPaginatedSupervisors(data)
  }
}
