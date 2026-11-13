import { injectable, inject } from 'tsyringe'

import type { PaginationRequestDto } from '@shared/dtos/pagination.dto'
import type {
  MilkRejectionResponseDto,
  MilkRejectionSaveDto,
  PaginatedMilkRejectionDto,
  ReasonDto
} from '@shared/dtos/milk-collection/milk-rejection.dto'
import { AppError, DatabaseError, ValidationError } from '../../../../utils/app-errors'
import { IMilkRejectionService } from '../i-milk-rejection.service'
import { TOKENS } from '../../../../core/di/token'
import type { IMilkRejectionRepo } from '../../repo/i-milk-rejection.repo'

@injectable()
export class MilkRejectionService implements IMilkRejectionService {
  constructor(
    @inject(TOKENS.MilkRejectionRepo)
    private readonly milkRejectionRepo: IMilkRejectionRepo
  ) {}

  async getPaginatedMilkRejections(data: PaginationRequestDto): Promise<PaginatedMilkRejectionDto> {
    const page = Math.max(1, Math.trunc(Number(data.page)) || 1)
    const limit = Math.max(1, Math.trunc(Number(data.limit)) || 10)
    const offset = (page - 1) * limit
    const search = data.search?.trim() || undefined

    try {
      const { rows, total } = await this.milkRejectionRepo.getPaginatedMilkRejections(
        search,
        limit,
        offset
      )
      const totalPages = Math.ceil(total / limit)

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
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch milk rejections', { cause: error })
    }
  }

  async saveMilkRejection(data: MilkRejectionSaveDto): Promise<MilkRejectionResponseDto> {
    if (!data.plant?.trim()) throw new ValidationError('Plant is required')
    if (!data.dskCode?.trim()) throw new ValidationError('DSK code is required')
    if (!data.reason?.trim()) throw new ValidationError('Reason is required')

    try {
      const row = await this.milkRejectionRepo.saveMilkRejection(data)
      if (!row) throw new DatabaseError('Milk rejection was saved but could not be retrieved')
      return {
        id: row.id,
        aproxQuantity: row.aprox_quantity,
        dskCode: row.dsk_code,
        dskName: row.dsk_name,
        noOfCanes: row.no_of_canes,
        plant: row.plant,
        reason: row.reason,
        route: row.route,
        shift: row.shift,
        supervisor: row.supervisor
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to save milk rejection', { cause: error })
    }
  }

  async getReasons(): Promise<ReasonDto[]> {
    try {
      const rows = await this.milkRejectionRepo.getReasons()
      return rows.map((r) => ({
        id: r.id,
        reason: r.reason
      }))
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch rejection reasons', { cause: error })
    }
  }
}
