import { ElectronAPI } from '@electron-toolkit/preload'
import { UpdateMilkCollectionDto } from '@shared/dtos/analysis/milk-analysis-update.dto'
import { SaveMilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection-save.dt'
import {
  MilkCollectionDto,
  PaginatedMilkCollectionDto
} from '@shared/dtos/milk-collection/milk-collection.dto'
import { WeightSystemDto } from '@shared/dtos/milk-collection/weight-system.dto'
import {
  MilkRejectionResponseDto,
  MilkRejectionSaveDto,
  ReasonDto
} from '@shared/dtos/milk-rejection/milk-rejection.dto'
import { PaginationRequestDto } from '@shared/dtos/pagination.dto'
import { PaginatedRoutesDto, RouteResponseDto } from '@shared/dtos/route/route-response.dto'
import { PaginatedSupervisorDto } from '@shared/dtos/supervisor/supervisor.dto'
import { UserResponseDto } from '@shared/dtos/user/user.dto'
import { PaginatedVendorsDto, VendoreDto } from '@shared/dtos/vendor/vendor.dto'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      // user
      login: (userName: string, password: string) => Promise<UserResponseDto>

      // routes
      getRoutes: () => Promise<RouteResponseDto[]>
      getPaginatedRoutes: (params: PaginationRequestDto) => Promise<PaginatedRoutesDto>
      // supervisor
      getSupervisors: () => Promise<SupervisorResponseDto[]>
      getPaginatedSupervisors: (params: PaginationRequestDto) => Promise<PaginatedSupervisorDto>
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

      // milk rejection
      getReasons: () => Promise<ReasonDto[]>
      getPaginatedMilkRejections: (
        params: PaginationRequestDto
      ) => Promise<PaginatedMilkRejectionDto>
      saveMilkRejection: (params: MilkRejectionSaveDto) => Promise<MilkRejectionResponseDto>

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
