import type { PaginatedUsersDto, UserResponseDto } from '@shared/dtos/user/user.dto'
import { PaginationRequestDto } from '@shared/dtos/pagination.dto'
import { PermissionDto } from '@shared/dtos/user/permission.dto'

export interface IUserService {
  login(userName: string, password: string): Promise<UserResponseDto>
  usersExist(): Promise<boolean>
  getPaginatedUsers(data: PaginationRequestDto): Promise<PaginatedUsersDto>
  getMenu(userId: number): Promise<PermissionDto[]>
}
