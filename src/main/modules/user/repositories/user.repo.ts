import { injectable } from 'tsyringe'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { CreateUserDto, UpdateUserDto, User } from '../dto/user.types'
import { db } from '../../../core/config/database.config'

interface UserRow extends RowDataPacket, User {}

@injectable()
export class UserRepository {
  async findAll(): Promise<User[]> {
    const [rows] = await db.execute<UserRow[]>(
      `SELECT id, name, email, phone, created_at
       FROM users
       ORDER BY id DESC`
    )
    return rows
  }

  async findById(id: number): Promise<User | null> {
    const [rows] = await db.execute<UserRow[]>(
      `SELECT id, name, email, phone, created_at
       FROM users
       WHERE id = ?`,
      [id]
    )

    return rows[0] ?? null
  }

  async create(data: CreateUserDto): Promise<User> {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO users (name, email, phone)
       VALUES (?, ?, ?)`,
      [data.name, data.email, data.phone || null]
    )

    const user = await this.findById(result.insertId)

    if (!user) {
      throw new Error('User was created but could not be retrieved.')
    }

    return user
  }

  async update(id: number, data: UpdateUserDto): Promise<User | null> {
    await db.execute<ResultSetHeader>(
      `UPDATE users
       SET name = ?, email = ?, phone = ?
       WHERE id = ?`,
      [data.name, data.email, data.phone || null, id]
    )

    return this.findById(id)
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>('DELETE FROM users WHERE id = ?', [id])

    return result.affectedRows > 0
  }
}
