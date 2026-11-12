import { injectable } from 'tsyringe'
import { db } from '../../../core/config/database.config'
import { CountRow, PagedUserRows, SyncUserRow, UserRow } from './user.rows'
import { OperationAction } from '../../../core/constants/operation-action.enum'
import { User } from '../dto/user-api-response'
import { DatabaseError } from '../../../utils/app-errors'
import { RowDataPacket } from 'mysql2'

const SQL_FIND_USER_BY_NAME = `
  SELECT *
    FROM \`user\`
   WHERE user_name = ?
   LIMIT 1`

@injectable()
export class UserRepo {
  async usersExist(): Promise<boolean> {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT EXISTS(
       SELECT 1 FROM user LIMIT 1
     ) AS isExist`
    )

    return Boolean(rows[0].isExist)
  }
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

  async getPaginatedUsers(
    search: string | undefined,
    limit: number,
    offset: number
  ): Promise<PagedUserRows> {
    let where = ''
    const params: string[] = []

    if (search) {
      where = 'WHERE (user_name LIKE ? OR user_code LIKE ?)'
      const like = `%${search}%`
      params.push(like, like)
    }

    const [[countRows], [rows]] = await Promise.all([
      db.query<CountRow[]>(`SELECT COUNT(*) AS total FROM user ${where}`, params),
      db.query<UserRow[]>(
        `SELECT *
             FROM user
             ${where}
            ORDER BY id ASC
            LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )
    ])

    return { rows, total: Number(countRows[0].total) }
  }
}
