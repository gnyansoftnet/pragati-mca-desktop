import { ElectronAPI } from '@electron-toolkit/preload'
import { MilkSampleDto, MilkSampleUpdateDto } from '@shared/dtos/milk-collection/milk-sample.dto'
import {
  PortConfig,
  PortListItem,
  SerialResult,
  SerialSnapshot
} from '@shared/dtos/connection/serial-com-port.dto'
import { SaveMilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection-save.dt'
import {
  MilkCollectionDto,
  PaginatedMilkCollectionDto
} from '@shared/dtos/milk-collection/milk-collection.dto'
import { WeightSystemDto } from '@shared/dtos/milk-collection/weight-system.dto'
import {
  MilkRejectionResponseDto,
  MilkRejectionSaveDto,
  PaginatedMilkRejectionDto, // FIX: was used but never imported (check the exact name in your dto file)
  ReasonDto
} from '@shared/dtos/milk-collection/milk-rejection.dto'
import { PaginationRequestDto } from '@shared/dtos/pagination.dto'
import { PaginatedRoutesDto, RouteResponseDto } from '@shared/dtos/route/route.dto'
import {
  PaginatedSupervisorDto,
  SupervisorResponseDto
} from '@shared/dtos/supervisor/supervisor.dto'
import { PaginatedUsersDto, UserResponseDto } from '@shared/dtos/user/user.dto'
import { PaginatedVendorsDto, VendoreResponseDto } from '@shared/dtos/vendor/vendor.dto'
import { SyncSucess } from '@shared/dtos/sync-success.dto'
import {
  PaginatedTransportDto,
  TransportDto,
  TransportSaveDto
} from '@shared/dtos/transport/transport.dto'
import {
  CansTypeDto,
  DashboardCountDto,
  LastSampleDateDto,
  LastSynckedMasterDto,
  MilkStatusDto,
  MilkTypesDto,
  ShiftDto
} from '@shared/dtos/master/master.dto'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      // user
      login: (userName: string, password: string) => Promise<UserResponseDto>
      syncUser: (plant: string, intial: string) => Promise<SyncSucess>
      usersExist: () => Promise<boolean>
      getPaginatedUsers: (params: PaginationRequestDto) => Promise<PaginatedUsersDto>

      // routes
      getRoutes: () => Promise<RouteResponseDto[]>
      getPaginatedRoutes: (params: PaginationRequestDto) => Promise<PaginatedRoutesDto>

      // supervisor
      getSupervisors: () => Promise<SupervisorResponseDto[]>
      getPaginatedSupervisors: (params: PaginationRequestDto) => Promise<PaginatedSupervisorDto>

      // vendor
      getVendors: () => Promise<VendoreResponseDto[]>
      getVendorsByRoute: (routeCode: string) => Promise<VendoreResponseDto[]>
      getPaginatedVendors: (params: PaginationRequestDto) => Promise<PaginatedVendorsDto>

      // sync process
      syncRoutes: (plant: string, org: string, branch: string) => Promise<SyncSucess>
      syncVendors: (plant: string, org: string, branch: string) => Promise<SyncSucess>
      syncSupervisors: (plant: string, org: string, branch: string) => Promise<SyncSucess>
      syncMilkCollection: (fromDate: string, toDate: string) => Promise<any>
      syncMilkRejection: (fromDate: string, toDate: string) => Promise<any>

      // master
      getDashboardCount: () => Promise<DashboardCountDto[]>
      getLastSampleDate: () => Promise<LastSampleDateDto>
      getWeightSystems: () => Promise<WeightSystemDto[]>
      getReasons: () => Promise<ReasonDto[]>
      getCanTypes: () => Promise<CansTypeDto[]>
      getMilkStatus: () => Promise<MilkStatusDto[]>
      getMilkType: () => Promise<MilkTypesDto[]>
      getShifts: () => Promise<ShiftDto[]>
      getLastSynckedMaster: (masterName: string) => Promise<LastSynckedMasterDto>

      // milk collection
      getPaginatedMilkCollctions: (
        params: PaginationRequestDto,
        fromDate?: string,
        toDate?: string,
        isAnalyse?: number
      ) => Promise<PaginatedMilkCollectionDto>
      saveMilkCollection: (params: SaveMilkCollectionDto) => Promise<MilkCollectionDto>
      getMilkCollections: () => Promise<MilkCollectionDto[]>

      // milk analysis
      updateMilkSample: (params: MilkSampleUpdateDto) => Promise<MilkSampleDto>
      getMilkSamples: (sampleDate: string, shift: number, plant: string) => Promise<MilkSampleDto[]>

      // transport
      getPaginatedTransports: (
        params: PaginationRequestDto,
        fromDate?: string,
        toDate?: string
      ) => Promise<PaginatedTransportDto>
      saveTransport: (params: TransportSaveDto) => Promise<TransportDto>

      // milk rejection
      getPaginatedMilkRejections: (
        params: PaginationRequestDto,
        fromDate?: string,
        toDate?: string
      ) => Promise<PaginatedMilkRejectionDto>
      saveMilkRejection: (params: MilkRejectionSaveDto) => Promise<MilkRejectionResponseDto>

      // serial port
      getSerialPorts: () => Promise<PortListItem[]>
      connectSerial: (cfg: PortConfig) => Promise<SerialResult>
      disconnectSerial: (path: string) => Promise<SerialResult>
      getSnapshot: () => Promise<SerialSnapshot>
      clearSerialReadings: (keys?: string[]) => Promise<void>
      onSerialSnapshot: (cb: (s: SerialSnapshot) => void) => () => void

      // network
      checkInternet: () => Promise<boolean>
    }
  }
}
