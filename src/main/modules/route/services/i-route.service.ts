import { PaginationRequestDto } from '@shared/dtos/pagination.dto'
import { PaginatedRoutesDto, RouteResponseDto } from '@shared/dtos/route/route.dto'

export interface IRouteService {
  getRoutes(): Promise<RouteResponseDto[]>
  getPaginatedRoutes(data: PaginationRequestDto): Promise<PaginatedRoutesDto>
}
