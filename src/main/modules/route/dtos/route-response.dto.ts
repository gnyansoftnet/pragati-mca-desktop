import { PaginatedResponseDto } from "../../../utils/pagination.dto";

export interface RouteResponseDto {
  id: number;
  routeName: string;
  routeCode: string;
}

export type PaginatedRoutesDto = PaginatedResponseDto<RouteResponseDto>;