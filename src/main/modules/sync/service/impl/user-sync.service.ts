import { inject, injectable } from 'tsyringe'
import { Url } from '../../../../core/constants/url'
import { ApiService } from '../../../../utils/api-service'
import { PermissionDto, UserDto, UserListResponseDto } from '../../dto/user-api-response'
import { IUserSyncService } from '../i-user-sync.service'
import { AppError, DatabaseError, ExternalApiError } from '../../../../utils/app-errors'
import { SyncSucess } from '@shared/dtos/sync-success.dto'
import type { IUserSyncRepo } from '../../repo/i-user-sync.repo'
import { TOKENS } from '../../../../core/di/token'

@injectable()
export class UserSyncService implements IUserSyncService {
  constructor(
    private readonly api: ApiService,
    @inject(TOKENS.UserSyncRepo)
    private readonly userSyncRepo: IUserSyncRepo
  ) {}

  async saveUsers(plant: string, intial: string): Promise<SyncSucess> {
    try {
      const users: UserDto[] = await this.syncDownUsers(plant, intial)
      const row = await this.userSyncRepo.saveUsers(users)
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

  async syncDownUsers(plant: string, intial: string): Promise<UserDto[]> {
    const { data } = await this.api.http.get<UserListResponseDto>(Url.user, {
      params: {
        plant,
        intial
      }
    })
    console.log('URI:', this.api.http.getUri({ url: Url.user, params: { plant, intial } }))
    console.log('Raw data[0]:', JSON.stringify(data.data[0]))
    if (!data?.success) {
      throw new ExternalApiError(`User API failed: ${data?.message ?? 'Unknown error'}`)
    }
    if (!Array.isArray(data.data) || data.data.length === 0) {
      throw new ExternalApiError(`Already plant used or do not have any user: ${data.message}`)
    }
    return data.data.map((u): UserDto => ({
      ...u,
      permissions: (u.permissions ?? []).map((p): PermissionDto => ({
        id: p.id,
        pageId: p.pageId,
        pageName: p.pageName,
        pageIcon: p.pageIcon,
        isAccess: p.isAccess,
        canRead: p.canRead,
        canWrite: p.canWrite,
        canUpdate: p.canUpdate,
        canDelete: p.canDelete
      }))
    }))
  }
}
