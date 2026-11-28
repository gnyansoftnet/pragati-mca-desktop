import { inject, injectable } from 'tsyringe'
import { PasswordService } from '../password.service'
import type { PaginatedUsersDto, UserResponseDto } from '@shared/dtos/user/user.dto'
import { PaginationRequestDto } from '@shared/dtos/pagination.dto'
import { AppError, DatabaseError, ValidationError } from '../../../../utils/app-errors'
import { IUserService } from '../i-user.service'
import { TOKENS } from '../../../../core/di/token'
import type { IUserRepo } from '../../repo/i-user.repo'
import { PermissionDto } from '@shared/dtos/user/permission.dto'
import { PermissionRow } from '../../dto/permission.row'

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TOKENS.UserRepo) private readonly userRepo: IUserRepo,
    @inject(PasswordService) private readonly passwordService: PasswordService
  ) {}

  async getMenu(userId: number): Promise<PermissionDto[]> {
    try {
      const data: PermissionRow[] = await this.userRepo.getMenu(userId)
      return data.map((d) => ({
        id: d.id,
        userId: d.user_id,
        isAccess: d.is_access,
        pageId: d.page_id,
        pageName: d.page_name,
        pageIcon: d.page_icon
      }))
    } catch (error: any) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to ', { cause: error })
    }
  }

  async login(userName: string, password: string): Promise<UserResponseDto> {
    // validation first, outside the try
    if (!userName?.trim()) throw new ValidationError('User name is required')
    if (!password) throw new ValidationError('Password is required')

    try {
      const user = await this.userRepo.findByUserName(userName.trim())

      // same message for "no user" and "wrong password"
      const valid = user ? await this.passwordService.compare(password, user.password) : false
      if (!user || !valid) throw new ValidationError('Invalid username or password')

      return {
        plantName: user.plant_name,
        id: user.id,
        userName: user.user_name,
        userCode: user.user_code,
        plant: user.plant,
        role: user.role,
        orgCode: user.org_code,
        branchCode: user.branch_code,
        branchId: user.branch_id,
        orgId: user.org_id,
        roleId: user.role_id,
        userId: user.user_id
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to sign in', { cause: error })
    }
  }

  async usersExist(): Promise<boolean> {
    try {
      const row = await this.userRepo.usersExist()
      return row
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to checkuser users', { cause: error })
    }
  }

  async getPaginatedUsers(data: PaginationRequestDto): Promise<PaginatedUsersDto> {
    const page = Math.max(1, Math.trunc(Number(data.page)) || 1)
    const limit = Math.max(1, Math.trunc(Number(data.limit)) || 10)
    const offset = (page - 1) * limit
    const search = data.search?.trim() || undefined

    try {
      const { rows, total } = await this.userRepo.getPaginatedUsers(search, limit, offset)
      const totalPages = Math.ceil(total / limit)

      return {
        data: rows.map((user) => ({
          plantName: user.plant_name,
          id: user.id,
          userName: user.user_name,
          userCode: user.user_code,
          plant: user.plant,
          role: user.role,
          orgCode: user.org_code,
          branchCode: user.branch_code,
          branchId: user.branch_id,
          orgId: user.org_id,
          roleId: user.role_id,
          userId: user.user_id
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
      throw new DatabaseError('Failed to fetch user', { cause: error })
    }
  }
}
