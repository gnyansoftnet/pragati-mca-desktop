import { injectable } from 'tsyringe'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { db } from '../../../core/config/database.config'
import {
  CreatePortConnectionDto,
  PortConnectionDto,
  UpdatePortConnectionDto
} from '../../../../shared/dtos/connection/port-connection.dto'

interface PortRow extends RowDataPacket {
  id: number
  port_name: string
  parity: string
  stop_bits: string
  braud_rate: string
  data_bits: string
}

@injectable()
export class PortConnectionRepo {
  async getConnectionPorts(): Promise<PortConnectionDto[]> {
    const [rows] = await db.execute<PortRow[]>(
      `SELECT *
       FROM port_connection_details
       ORDER BY id ASC`
    )
    return rows.map((r) => ({
      id: r.id,
      braudRate: r.braud_rate,
      dataBits: r.data_bits,
      parity: r.parity,
      portName: r.port_name,
      stopBits: r.stop_bits
    }))
  }

  async findById(id: number): Promise<PortConnectionDto | null> {
    const [rows] = await db.execute<PortRow[]>(
      `SELECT *
         FROM port_connection_details
         WHERE id = ?`,
      [id]
    )
    const r = rows[0]
    if (!r) return null
    return {
      id: r.id,
      braudRate: r.braud_rate,
      dataBits: r.data_bits,
      parity: r.parity,
      portName: r.port_name,
      stopBits: r.stop_bits
    }
  }

  async createPort(data: CreatePortConnectionDto): Promise<PortConnectionDto> {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO port_connection_details
        (port_name, parity, stop_bits, braud_rate, data_bits)
        VALUES (?, ?, ?, ?, ?)`,
      [
        data.portName,
        data.parity ?? '0',
        data.stopBits ?? '0',
        data.braudRate ?? '0',
        data.dataBits ?? '0'
      ]
    )

    const port = await this.findById(result.insertId)

    if (!port) {
      throw new Error('Port connection was created but could not be retrieved.')
    }

    return port
  }

  async updatePort(id: number, data: UpdatePortConnectionDto): Promise<PortConnectionDto | null> {
    await db.execute<ResultSetHeader>(
      `UPDATE port_connection_details
         SET port_name = ?,
             parity = ?,
             stop_bits = ?,
             braud_rate = ?,
             data_bits = ?
         WHERE id = ? AND d_flag = 0`,
      [
        data.portName,
        data.parity ?? '0',
        data.stopBits ?? '0',
        data.braudRate ?? '0',
        data.dataBits ?? '0',
        id
      ]
    )

    return this.findById(id)
  }
}
