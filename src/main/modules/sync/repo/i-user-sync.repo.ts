import { SyncUserRow } from '../../user/dto/user.rows'
import { UserDto } from '../dto/user-api-response'

export interface IUserSyncRepo {
  saveUsers(items: UserDto[]): Promise<SyncUserRow>
}
