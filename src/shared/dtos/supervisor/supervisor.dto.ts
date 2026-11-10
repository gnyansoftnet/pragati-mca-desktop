import { PaginatedResponseDto } from '../pagination.dto'

export interface SupervisorResponseDto {
  id: number
  employeeId: string
  firstName: string
  lastName: string
  plant: string
  contactNo: string
}

export type PaginatedSupervisorDto = PaginatedResponseDto<SupervisorResponseDto>
