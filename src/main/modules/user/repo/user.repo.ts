import { injectable } from 'tsyringe'
import { db } from '../../../core/config/database.config'
import { SyncUserRow, UserRow } from './user.rows'
import { OperationAction } from '../../../core/constants/operation-action.enum'
import { User } from '../dto/user-api-response'
import { DatabaseError } from '../../../utils/app-errors'

const SQL_FIND_USER_BY_NAME = `
  SELECT id, user_name, user_code, password, plant, role
    FROM \`user\`
   WHERE user_name = ?
   LIMIT 1`

@injectable()
export class UserRepo {
  async findByUserName(userName: string): Promise<UserRow | undefined> {
    const [rows] = await db.execute<UserRow[]>(SQL_FIND_USER_BY_NAME, [userName])
    return rows[0]
  }
  async saveUsers(items: User[]): Promise<SyncUserRow> {
    const [result] = await db.query<SyncUserRow[][]>('CALL USP_M_USER_SYNC(?, ?)', [
      OperationAction.SYNCDOWN,
      JSON.stringify(items)
    ])

    const row = result?.[0]?.[0]
    if (!row) throw new DatabaseError('Route sync returned no result')
    if (!row.success) throw new DatabaseError(row.message)
    return row
  }
}
