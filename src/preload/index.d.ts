import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  PaginatedRoutesDto,
  RouteResponseDto
} from '../main/modules/route/dto/route-response.dto'
import type { VendoreDto, PaginatedVendorsDto } from '../main/modules/vendor/dto/vendor.dto'
import type {
  PaginatedMilkCollectionDto,
  MilkCollectionDto
} from '../main/modules/milk_collection/dtos/milk-collection.dto'
import type { SaveMilkCollectionDto } from '../main/modules/milk_collection/dtos/milk-collection-save.dto'
import type { WeightSystemDto } from '../main/modules/milk_collection/dtos/weight-system.dto'
import type { UpdateMilkCollectionDto } from '../main/modules/analysis/dtos/milk-analysis-update.dto'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      // routes
      getRoutes: () => Promise<RouteResponseDto[]>
      getPaginatedRoutes: (params: PaginationRequestDto) => Promise<PaginatedRoutesDto>

      //  vendor
      getVendors: () => Promise<VendoreDto[]>
      getPaginatedVendors: (params: PaginationRequestDto) => Promise<PaginatedVendorsDto>

      // milk collection
      getPaginatedMilkCollctions: (
        params: PaginationRequestDto
      ) => Promise<PaginatedMilkCollectionDto>
      saveMilkCollection: (params: SaveMilkCollectionDto) => Promise<MilkCollectionDto>
      getWeightSystems: () => Promise<WeightSystemDto>

      //  milk collection
      updateMilkAnalysis: (params: UpdateMilkCollectionDto) => Promise<any>

      //  port
      getSerialPorts: () => Promise<{ path: string }[]>
      connectSerial: (params: {
        path: string
        baudRate: number
        parity: string
        dataBits: number
        stopBits: number
      }) => Promise<{ ok: boolean; error?: string }>
      disconnectSerial: () => Promise<void>
    }
  }
}
