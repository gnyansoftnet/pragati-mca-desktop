import { PaginatedResponseDto } from "../../../main/utils/pagination.dto"

export interface UserResponseDto {
  id: number
  userName: string
  plantName: string
  userCode: string
  plant: string
  role: string
  userId: number
  orgId: number
  branchId: number
  roleId: number
  orgCode: string
  branchCode: string
}
export type PaginatedUsersDto = PaginatedResponseDto<UserResponseDto>