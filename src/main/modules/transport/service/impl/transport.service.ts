import { PaginationRequestDto } from '@shared/dtos/pagination.dto'
import {
  PaginatedTransportDto,
  TransportSaveDto,
  TransportDto
} from '@shared/dtos/transport/transport.dto'
import { ITransportService } from '../i-transport.service'
import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../../../core/di/token'
import type { ITransportRepo } from '../../repo/i-transport.repo'
import { AppError, DatabaseError } from '../../../../utils/app-errors'
import { TransportRow } from '../../dto/transport.row'

@injectable()
export class TransportService implements ITransportService {
  constructor(
    @inject(TOKENS.TransportRepo)
    private readonly transportRepo: ITransportRepo
  ) {}
  async getPaginatedTransports(
    data: PaginationRequestDto,
    fromDate?: string,
    toDate?: string
  ): Promise<PaginatedTransportDto> {
    const page = Math.max(1, Math.trunc(Number(data.page)) || 1)
    const limit = Math.max(1, Math.trunc(Number(data.limit)) || 10)
    const offset = (page - 1) * limit
    const search = data.search?.trim() || undefined

    try {
      const { rows, total } = await this.transportRepo.getPaginatedTransports(
        search,
        limit,
        offset,
        fromDate,
        toDate
      )
      const totalPages = Math.ceil(total / limit)

      return {
        data: rows.map((row) => ({
          id: row.id,
          transportCode: row.transport_code,
          plant: row.plant,
          transportDate: row.transport_date,
          shift: row.shift,
          routeCode: row.route_code,
          routeName: row.route_name,
          trasporter: row.trasporter,
          vehicleRcNo: row.vehicle_rc_no,
          driverName: row.driver_name,
          syncDate: row.sync_date,
          syncStatus: row.sync_status,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          dFalg: row.d_falg
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
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch milk rejections', { cause: error })
    }
  }

  async saveTransport(data: TransportSaveDto): Promise<TransportDto> {
    try {
      const row: TransportRow = await this.transportRepo.saveTransport(data)
      if (!row) throw new DatabaseError('Milk rejection was saved but could not be retrieved')
      return {
        id: row.id,
        transportCode: row.plant,
        plant: row.plant,
        transportDate: row.transport_date,
        shift: row.shift,
        routeCode: row.route_code,
        routeName: row.route_name,
        trasporter: row.trasporter,
        vehicleRcNo: row.vehicle_rc_no,
        driverName: row.driver_name,
        syncDate: row.sync_date,
        syncStatus: row.sync_status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        dFalg: row.d_falg
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to save transport', {
        cause: error
      })
    }
  }
}
