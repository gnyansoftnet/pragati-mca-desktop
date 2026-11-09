import { inject, injectable } from 'tsyringe'
import { PasswordService } from './password.service'
import type { UserResponseDto } from '@shared/dtos/user/user.dto'
import { UserRepo } from '../repo/user.repo'
import { AppError, DatabaseError, ValidationError } from '../../../utils/app-errors'
import { UserSyncService } from './user-sync.service'
import { SyncUser } from '../repo/user.rows'

@injectable()
export class UserService {
  constructor(
    @inject(UserRepo) private readonly userRepo: UserRepo,
    @inject(PasswordService) private readonly passwordService: PasswordService,
    @inject(UserSyncService) private readonly userApi: UserSyncService
  ) {}

  async login(userName: string, password: string): Promise<UserResponseDto> {
    // validation first, outside the try
    if (!userName?.trim()) throw new ValidationError('User name is required')
    if (!password) throw new ValidationError('Password is required')

    try {
      const user = await this.userRepo.findByUserName(userName.trim())

      // same message for "no user" and "wrong password"
      const valid = user ? await this.passwordService.compare(password, user.password) : false
      if (!user || !valid) throw new ValidationError('Invalid username or password')

      // const payLoad = {
      //   userCode: user.userCode,
      //   userId: user.user_id,
      //   orgId: user.org_id,
      //   branchId: user.branch_id,
      //   roleId: user.role_id
      // }

      // const accessToken = this.tokenService.generateAccessToken(payLoad)
      // const refreshToken = this.tokenService.generateRefreshToken(payLoad)

      return {
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

  async saveRoutes(plant: string): Promise<SyncUser> {
    try {
      const users = await this.userApi.syncDownUsers(plant)
      const row = await this.userRepo.saveUsers(users)
      return {
        success: Number(row.success),
        message: row.message,
        total: Number(row.total)
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to save users', { cause: error })
    }
  }
}
