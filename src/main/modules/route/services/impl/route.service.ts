import { injectable, inject } from 'tsyringe'
import type { PaginationRequestDto } from '@shared/dtos/pagination.dto'

import { AppError, DatabaseError } from '../../../../utils/app-errors'
import { IRouteService } from '../i-route.service'
import { TOKENS } from '../../../../core/di/token'
import type { IRouteRepo } from '../../repositories/i-route.repo'
import { PaginatedRoutesDto, RouteResponseDto } from '@shared/dtos/route/route.dto'

@injectable()
export class RouteService implements IRouteService {
  constructor(@inject(TOKENS.RouteRepo) private readonly routeRepo: IRouteRepo) {}

  async getRoutes(): Promise<RouteResponseDto[]> {
    try {
      const rows = await this.routeRepo.getRoutes()
      return rows.map((r) => ({
        id: r.id,
        routeName: r.route_name,
        routeCode: r.route_code
      }))
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch routes', { cause: error })
    }
  }

  async getPaginatedRoutes(data: PaginationRequestDto): Promise<PaginatedRoutesDto> {
    const page = Math.max(1, Math.trunc(Number(data.page)) || 1)
    const limit = Math.max(1, Math.trunc(Number(data.limit)) || 10)
    const offset = (page - 1) * limit
    const search = data.search?.trim() || undefined

    try {
      const { rows, total } = await this.routeRepo.getPaginatedRoutes(search, limit, offset)
      const totalPages = Math.ceil(total / limit)

      return {
        data: rows.map((r) => ({
          id: r.id,
          routeName: r.route_name,
          routeCode: r.route_code
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
      throw new DatabaseError('Failed to fetch routes', { cause: error })
    }
  }
}
