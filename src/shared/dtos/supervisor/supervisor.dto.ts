import { PaginatedResponseDto } from '../pagination.dto'

export interface SupervisorResponseDto {
  id: number
  empId: string
  firstName: string
  lastName: string
  plant: string
  contactNo: string
}

export type PaginatedSupervisorDto = PaginatedResponseDto<SupervisorResponseDto>
