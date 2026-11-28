import { injectable } from 'tsyringe'
import { db } from '../../../../core/config/database.config'
import { CountRow, PagedUserRows, UserRow } from '../../dto/user.rows'
import { RowDataPacket } from 'mysql2'
import { IUserRepo } from '../i-user.repo'
import { PermissionRow } from '../../dto/permission.row'

const SQL_FIND_USER_BY_NAME = `
  SELECT *
    FROM \`user\`
   WHERE user_name = ?
   LIMIT 1`

@injectable()
export class UserRepo implements IUserRepo {
  async getMenu(userId: number): Promise<PermissionRow[]> {
    const [rows] = await db.query<PermissionRow[]>(
      `SELECT
        id,
        user_id,
         is_access,
        page_id,
        page_name,
        page_icon
     FROM desktop_user_permissions
     WHERE user_id = ?
       AND d_flag = 0
       AND is_access = 1
     ORDER BY page_id ASC`,
      [userId]
    )
    return rows
  }

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
