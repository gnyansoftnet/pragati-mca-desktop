import { injectable } from 'tsyringe'
import type { RowDataPacket } from 'mysql2'
import { db } from '../../../core/config/database.config'
import { PaginationRequestDto } from '../../../../shared/dtos/pagination.dto'
import {
  PaginatedSupervisorDto,
  SupervisorResponseDto
} from '../../../../shared/dtos/supervisor/supervisor.dto'

interface SupervisorRow extends RowDataPacket {
  id: number
  emp_id: string
  first_name: string
  last_name: string
  contact_no: string
  plant: string
}

interface CountRow extends RowDataPacket {
  total: number
}

@injectable()
export class SupervisorRepo {
  async getSupervisors(): Promise<SupervisorResponseDto[]> {
    const [rows] = await db.execute<SupervisorRow[]>(
      `SELECT *
       FROM supervisor
       ORDER BY id ASC`
    )
    return rows.map((r) => ({
      id: r.id,
      empId: r.emp_id,
      firstName: r.first_name,
      lastName: r.last_name,
      plant: r.plant,
      contactNo: r.contact_no
    }))
  }

  async getPaginatedSupervisors(data: PaginationRequestDto): Promise<PaginatedSupervisorDto> {
    const page = Number(data.page)
    const limit = Number(data.limit)
    const offset = (page - 1) * limit

    let where = ''
    const whereParams: string[] = []

    const term = data.search?.trim()
    if (term) {
      where = `WHERE (contact_no LIKE ? OR first_name LIKE ? OR employee_id LIKE ? )`
      const like = `%${term}%`
      whereParams.push(like, like, like)
    }
    const [countRows] = await db.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM supervisor ${where}`,
      whereParams
    )
    const total = Number(countRows[0].total)
    const totalPages = Math.ceil(total / limit)

    const [rows] = await db.query<SupervisorRow[]>(
      `SELECT *
       FROM supervisor
       ${where}
       ORDER BY id ASC
       LIMIT ? OFFSET ?`,
      [...whereParams, limit, offset]
    )

    return {
      data: rows.map((r) => ({
        id: r.id,
        empId: r.emp_id,
        firstName: r.first_name,
        lastName: r.last_name,
        plant: r.plant,
        contactNo: r.contact_no
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  }
}
