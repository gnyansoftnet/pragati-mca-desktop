import { injectable } from 'tsyringe'
import { db } from '../../../../core/config/database.config'
import { OperationAction } from '../../../../core/constants/operation-action.enum'
import { DatabaseError } from '../../../../utils/app-errors'
import { SyncUserRow } from '../../../user/dto/user.rows'
import { UserDto } from '../../dto/user-api-response'
import { IUserSyncRepo } from '../i-user-sync.repo'

@injectable()
export class UserSyncRepo implements IUserSyncRepo {
  async saveUsers(items: UserDto[]): Promise<SyncUserRow> {
    console.log('First user payload:', JSON.stringify(items[0]))
    const [result] = await db.query<SyncUserRow[][]>('CALL USP_M_USER_SYNC(?, ?)', [
      OperationAction.SYNCDOWN,
      JSON.stringify(items)
    ])
    console.log('SP result:', result)
    const row = result?.[0]?.[0]
    if (!row) throw new DatabaseError('User sync returned no result')
    if (!row.success) throw new DatabaseError(row.message)
    return row
  }
}
