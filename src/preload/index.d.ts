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
  LastSynckedMilkCollectionDto,
  LastSynckedMilkRejectionDto,
  MilkStatusDto,
  MilkTypesDto,
  ShiftDto
} from '@shared/dtos/master/master.dto'
import { PeriodicReportDto } from '@shared/dtos/reports/periodic-report.dto'
import { PaginatedRejectionMilkReportDto } from '@shared/dtos/reports/rejection-milk-report.dto'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      // =============================USER==========================
      login: (userName: string, password: string) => Promise<UserResponseDto>
      usersExist: () => Promise<boolean>
      getMenu: (userId: number) => Promise<PermissionDto[]>
      getPaginatedUsers: (params: PaginationRequestDto) => Promise<PaginatedUsersDto>

      // =====================ROUTES====================
      getRoutes: () => Promise<RouteResponseDto[]>
      getPaginatedRoutes: (params: PaginationRequestDto) => Promise<PaginatedRoutesDto>

      // =================================SUPERVISOR======================
      getSupervisors: () => Promise<SupervisorResponseDto[]>
      getPaginatedSupervisors: (params: PaginationRequestDto) => Promise<PaginatedSupervisorDto>

      // =================================VENDOR==========================
      getVendors: () => Promise<VendoreResponseDto[]>
      getVendorsByRoute: (routeCode: string) => Promise<VendoreResponseDto[]>
      getPaginatedVendors: (params: PaginationRequestDto) => Promise<PaginatedVendorsDto>

      // ===========================SYNC PROCESS=========================
      syncUser: (plant: string, intial: string) => Promise<SyncSucess>
      syncRoutes: (plant: string, org: string, branch: string) => Promise<SyncSucess>
      syncVendors: (plant: string, org: string, branch: string) => Promise<SyncSucess>
      syncSupervisors: (plant: string, org: string, branch: string) => Promise<SyncSucess>
      syncMilkCollection: (date: string, shift: number) => Promise<any>
      syncMilkRejection: (date: string, shift: number) => Promise<any>

      // ================================MASTER========================
      getDashboardCount: () => Promise<DashboardCountDto[]>
      getWeightSystems: () => Promise<WeightSystemDto[]>
      getReasons: () => Promise<ReasonDto[]>
      getCanTypes: () => Promise<CansTypeDto[]>
      getMilkStatus: () => Promise<MilkStatusDto[]>
      getMilkType: () => Promise<MilkTypesDto[]>
      getShifts: () => Promise<ShiftDto[]>
      getLastSampleDate: () => Promise<LastSampleDateDto>
      getLastSynckedMaster: (masterName: string) => Promise<LastSynckedMasterDto>
      getLastSynckedMilkCollection: () => Promise<LastSynckedMilkCollectionDto>
      getLastSynckedMilkRejection: () => Promise<LastSynckedMilkRejectionDto>

      // ====================================REPORT=====================================
      getTruckSheetReport: (
        params: PaginationRequestDto,
        shift?: number,
        date?: string,
        isAnalyse?: number,
        routeCode?: string,
        vendorCode?: string
      ) => Promise<PaginatedMilkCollectionDto>
      getRejectionReport: (
        params: PaginationRequestDto,
        shift?: number,
        date?: string,
        routeCode?: string,
        vendorCode?: string
      ) => Promise<PaginatedRejectionMilkReportDto>
      getPeriodicReport: (fromDate: string, toDate: string) => Promise<PeriodicReportDto[]>

      // =========================MILK COLLECTION=========================
      getPaginatedMilkCollctions: (
        params: PaginationRequestDto,
        shift?: number,
        date?: string,
        isAnalyse?: number
      ) => Promise<PaginatedMilkCollectionDto>
      saveMilkCollection: (params: SaveMilkCollectionDto) => Promise<MilkCollectionDto>
      getMilkCollections: (date: string, shift: number) => Promise<MilkCollectionDto[]>

      // ===================MILK ANALYSIS======================
      updateMilkSample: (params: MilkSampleUpdateDto) => Promise<MilkSampleDto>
      getMilkSamples: (sampleDate: string, shift: number, plant: string) => Promise<MilkSampleDto[]>

      // =======================MILK REJECTION====================
      getPaginatedMilkRejections: (
        params: PaginationRequestDto,
        shift?: string | number,
        date?: string
      ) => Promise<PaginatedMilkRejectionDto>
      saveMilkRejection: (params: MilkRejectionSaveDto) => Promise<MilkRejectionResponseDto>

      // ========================TRANSPORT=========================
      getPaginatedTransports: (
        params: PaginationRequestDto,
        fromDate?: string,
        toDate?: string
      ) => Promise<PaginatedTransportDto>
      saveTransport: (params: TransportSaveDto) => Promise<TransportDto>

      // =============================SERIAL PORT=====================
      getSerialPorts: () => Promise<PortListItem[]>
      connectSerial: (cfg: PortConfig) => Promise<SerialResult>
      disconnectSerial: (path: string) => Promise<SerialResult>
      getSnapshot: () => Promise<SerialSnapshot>
      clearSerialReadings: (keys?: string[]) => Promise<void>
      onSerialSnapshot: (cb: (s: SerialSnapshot) => void) => () => void

      // ===============================INTERNET===========================
      checkInternet: () => Promise<boolean>
    }
  }
}
