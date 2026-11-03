import { injectable } from 'tsyringe'
import type { RowDataPacket } from 'mysql2'
import { db } from '../../../core/config/database.config'

interface UserRow extends RowDataPacket {
  id: number
  user_name: string
  user_code: string
  plant: string
  role: string
}
@injectable()
export class UserRepo {
  async findByUserName(userName: string): Promise<UserRow | null> {
    const [rows] = await db.execute<UserRow[]>(
      `SELECT id, user_name, user_code, plant, role
       FROM user
       WHERE user_name = ?
       LIMIT 1`,
      [userName]
    )
    return rows[0] ?? null
  }
}
