import { SyncSucess } from '@shared/dtos/sync-success.dto'
import { UserDto } from '../dto/user-api-response'

export interface IUserSyncService {
  syncDownUsers(plant: string, intial: string): Promise<UserDto[]>
  saveUsers(plant: string, intial: string): Promise<SyncSucess>
}
