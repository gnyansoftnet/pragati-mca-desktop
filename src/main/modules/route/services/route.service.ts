import { injectable, inject } from 'tsyringe'
import { RouteRepo } from '../repositories/route.repo'
import {
  PaginatedRoutesDto,
  RouteResponseDto
} from '../../../../shared/dtos/route/route-response.dto'
import { PaginationRequestDto } from '../../../../shared/dtos/pagination.dto'

@injectable()
export class RouteService {
  constructor(
    @inject(RouteRepo)
    private readonly routeRepo: RouteRepo
  ) {}

  async getRoutes(): Promise<RouteResponseDto[]> {
    return await this.routeRepo.getRoutes()
  }

  async getPaginatedRoutes(data: PaginationRequestDto): Promise<PaginatedRoutesDto> {
    if (data.page <= 0) throw new Error('Page must be greater than 0')
    if (data.limit <= 0) throw new Error('Limit must be greater than 0')
    return await this.routeRepo.getPaginatedRoutes(data)
  }
}
