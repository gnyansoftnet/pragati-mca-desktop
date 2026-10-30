import { ElectronAPI } from '@electron-toolkit/preload'
import type {PaginatedRoutesDto, RouteResponseDto } from '../main/modules/route/dto/route-response.dto'
import type {PaginatedRoutesDto, RouteResponseDto } from '../main/modules/milk_collection/dto/route-response.dto'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getRoutes: () => Promise<RouteResponseDto[]>
     getPaginatedRoutes: (params: PaginationRequestDto) => Promise<PaginatedRoutesDto>

     getPaginatedMilkCollctions: (params: PaginationRequestDto) => Promise<PaginatedMilkCollectionDto>
    }
  }
}