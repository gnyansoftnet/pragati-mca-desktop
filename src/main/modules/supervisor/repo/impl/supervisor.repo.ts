import { injectable } from 'tsyringe'

import { db } from '../../../../core/config/database.config'
import { ISupervisorRepo } from '../i-supervisor.repo'
import { CountRow, PagedSupervisorRows, SupervisorRow } from '../../dto/supervisor.rows'

const SUPERVISOR_COLUMNS = `id, employee_id, first_name, last_name, contact_no, plant`

const SQL_GET_SUPERVISORS = `
  SELECT ${SUPERVISOR_COLUMNS}
    FROM supervisor
   ORDER BY id ASC`

@injectable()
export class SupervisorRepo implements ISupervisorRepo {
  constructor() {}

  async getSupervisors(): Promise<SupervisorRow[]> {
    const [rows] = await db.execute<SupervisorRow[]>(SQL_GET_SUPERVISORS)
    return rows
  }
  async getPaginatedSupervisors(
    search: string | undefined,
    limit: number,
    offset: number
  ): Promise<PagedSupervisorRows> {
    let where = ''
    const params: string[] = []

    if (search) {
      where = 'WHERE (contact_no LIKE ? OR first_name LIKE ? OR employee_id LIKE ?)'
      const like = `%${search}%`
      params.push(like, like, like)
    }

    const [[countRows], [rows]] = await Promise.all([
      db.query<CountRow[]>(`SELECT COUNT(*) AS total FROM supervisor ${where}`, params),
      db.query<SupervisorRow[]>(
        `SELECT ${SUPERVISOR_COLUMNS}
           FROM supervisor
           ${where}
          ORDER BY id ASC
          LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )
    ])

    return { rows, total: Number(countRows[0].total) }
  }
}
