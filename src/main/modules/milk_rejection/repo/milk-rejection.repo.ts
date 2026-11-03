import { injectable } from 'tsyringe'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { db } from '../../../core/config/database.config'
import { PaginationRequestDto } from '../../../utils/pagination.dto'
import {
  MilkRejectionResponseDto,
  MilkRejectionSaveDto,
  PaginatedMilkRejectionDto,
  ReasonDto
} from '../dtos/milk-rejection.dto'

interface MilkRejectionRow extends RowDataPacket {
  id: number
  plant: string
  dsk_name: string
  dsk_code: string
  route: string
  supervisor: string
  shift: string
  no_of_canes: string
  aprox_quantity: string
  reason: string
  sync_status: string
  created_at: string
  updated_at: string
}

interface ReasonRow extends RowDataPacket {
  id: number
  reason: string
}

interface CountRow extends RowDataPacket {
  total: number
}
@injectable()
export class MilkRejectionRepo {
  async getReasons(): Promise<ReasonDto[]> {
    const [rows] = await db.execute<ReasonRow[]>(
      `SELECT *
          FROM rejection_reason
          ORDER BY id ASC`
    )
    return rows.map((r) => ({
      id: r.id,
      reason: r.reason
    }))
  }

  async getPaginatedMilkRejections(data: PaginationRequestDto): Promise<PaginatedMilkRejectionDto> {
    const page = Number(data.page)
    const limit = Number(data.limit)
    const offset = (page - 1) * limit

    let where = ''
    const whereParams: string[] = []

    const term = data.search?.trim()
    if (term) {
      where = `WHERE (dsk_name LIKE ? OR route LIKE ? OR supervisor LIKE)`
      const like = `%${term}%`
      whereParams.push(like, like, like)
    }
    const [countRows] = await db.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM rejection_milk ${where}`,
      whereParams
    )
    const total = Number(countRows[0].total)
    const totalPages = Math.ceil(total / limit)

    const [rows] = await db.query<MilkRejectionRow[]>(
      `SELECT *
         FROM rejection_milk;
         ${where}
         ORDER BY id ASC
         LIMIT ? OFFSET ?`,
      [...whereParams, limit, offset]
    )
    return {
      data: rows.map((r) => ({
        id: r.id,
        aproxQuantity: r.aprox_quantity,
        dskCode: r.dsk_code,
        dskName: r.dsk_name,
        noOfCanes: r.no_of_canes,
        plant: r.plant,
        reason: r.reason,
        route: r.route,
        shift: r.shift,
        supervisor: r.supervisor
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

  async getRejectionMilk(id: number): Promise<MilkRejectionResponseDto | null> {
    const [rows] = await db.execute<MilkRejectionRow[]>(
      `SELECT *
           FROM rejection_milk
           WHERE id = ?`,
      [id]
    )
    const r = rows[0]
    if (!r) return null
    return {
      id: r.id,
      aproxQuantity: r.aprox_quantity,
      dskCode: r.dsk_code,
      dskName: r.dsk_name,
      noOfCanes: r.no_of_canes,
      plant: r.plant,
      reason: r.reason,
      route: r.route,
      shift: r.shift,
      supervisor: r.supervisor
    }
  }

  async saveMilkRejection(data: MilkRejectionSaveDto): Promise<MilkRejectionResponseDto> {
    const sql = `
    INSERT INTO rejection_milk
    (
      plant,
      dsk_name,
      dsk_code,
      route,
      supervisor,
      shift,
      no_of_canes,
      aprox_quantity,
      reason
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    const values = [
      data.plant,
      data.dskName,
      data.dskCode,
      data.route,
      data.supervisor,
      data.shift,
      data.noOfCanes,
      data.aproxQuantity,
      data.reason
    ]

    const [result] = await db.execute<ResultSetHeader>(sql, values)

    if (!result.insertId) {
      throw new Error('Failed to save milk rejection.')
    }

    const rejectionMilk = await this.getRejectionMilk(result.insertId)

    if (!rejectionMilk) {
      throw new Error('Milk rejection was saved but could not be retrieved.')
    }

    return rejectionMilk
  }

  //   async updatePort(id: number, data: UpdatePortConnectionDto): Promise<PortConnectionDto | null> {
  //     await db.execute<ResultSetHeader>(
  //       `UPDATE port_connection_details
  //          SET port_name = ?,
  //              parity = ?,
  //              stop_bits = ?,
  //              braud_rate = ?,
  //              data_bits = ?
  //          WHERE id = ? AND d_flag = 0`,
  //       [
  //         data.portName,
  //         data.parity ?? '0',
  //         data.stopBits ?? '0',
  //         data.braudRate ?? '0',
  //         data.dataBits ?? '0',
  //         id
  //       ]
  //     )

  //     return this.findById(id)
  //   }
}
