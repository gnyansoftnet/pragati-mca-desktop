import type { PaginationRequestDto } from '@shared/dtos/pagination.dto'
import type {
  PaginatedSupervisorDto,
  SupervisorResponseDto
} from '@shared/dtos/supervisor/supervisor.dto'

export interface ISupervisorService {
  getSupervisors(): Promise<SupervisorResponseDto[]>
  getPaginatedSupervisors(data: PaginationRequestDto): Promise<PaginatedSupervisorDto>
}
