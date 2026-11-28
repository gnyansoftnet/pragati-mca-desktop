import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { PaginationRequestDto } from '../shared/dtos/pagination.dto'
import {
  MilkRejectionResponseDto,
  MilkRejectionSaveDto,
  PaginatedMilkRejectionDto
} from '../shared/dtos/milk-collection/milk-rejection.dto'
import { PaginatedUsersDto, UserResponseDto } from '@shared/dtos/user/user.dto'
import {
  PortConfig,
  PortListItem,
  SerialResult,
  SerialSnapshot
} from '@shared/dtos/connection/serial-com-port.dto'
import { MilkSampleDto, MilkSampleUpdateDto } from '@shared/dtos/milk-collection/milk-sample.dto'
import { PaginatedRoutesDto, RouteResponseDto } from '@shared/dtos/route/route.dto'
import { PaginatedVendorsDto, VendoreResponseDto } from '@shared/dtos/vendor/vendor.dto'
import {
  PaginatedSupervisorDto,
  SupervisorResponseDto
} from '@shared/dtos/supervisor/supervisor.dto'
import {
  MilkCollectionDto,
  PaginatedMilkCollectionDto,
  SaveMilkCollectionDto
} from '@shared/dtos/milk-collection/milk-collection.dto'
import { SyncSucess } from '@shared/dtos/sync-success.dto'
import {
  PaginatedTransportDto,
  TransportDto,
  TransportSaveDto as TransportSaveDto
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
  ReasonDto,
  ShiftDto,
  WeightSystemDto
} from '@shared/dtos/master/master.dto'
import { PeriodicReportDto } from '@shared/dtos/reports/periodic-report.dto'
import { PermissionDto } from '@shared/dtos/user/permission.dto'

// Custom APIs for renderer

const api = {
  // ==============================USER============================
  login: (userName: string, password: string): Promise<UserResponseDto> =>
    ipcRenderer.invoke('user:login', userName, password),
  usersExist: (): Promise<boolean> => ipcRenderer.invoke('user:usersExist'),
  getMenu: (userId: number): Promise<PermissionDto[]> => ipcRenderer.invoke('user:getMenu', userId),
  getPaginatedUsers: (params: PaginationRequestDto): Promise<PaginatedUsersDto> =>
    ipcRenderer.invoke('user:getPaginatedUsers', params),

  // ===================================SYNC PROCESS====================================
  syncUser: (plant: string, intial: string): Promise<SyncSucess> =>
    ipcRenderer.invoke('user-sync:syncUser', plant, intial),
  syncRoutes: (plant: string, org: string, branch: string): Promise<SyncSucess> =>
    ipcRenderer.invoke('route-sync:syncRoutes', plant, org, branch),

  syncVendors: (plant: string, org: string, branch: string): Promise<SyncSucess> =>
    ipcRenderer.invoke('vendor-sync:syncVendors', plant, org, branch),

  syncSupervisors: (plant: string, org: string, branch: string): Promise<SyncSucess> =>
    ipcRenderer.invoke('supervisor-sync:syncSupervisors', plant, org, branch),

  syncMilkCollection: (date: string, shift: number): Promise<SyncSucess> =>
    ipcRenderer.invoke('procurement-sync:syncMilkCollection', date, shift),

  syncMilkRejection: (date: string, shift: number): Promise<SyncSucess> =>
    ipcRenderer.invoke('procurement-sync:syncMilkRejection', date, shift),

  // ==============================ROUTES==================================
  getRoutes: (): Promise<RouteResponseDto[]> => ipcRenderer.invoke('route:getRoutes'),
  getPaginatedRoutes: (params: PaginationRequestDto): Promise<PaginatedRoutesDto> =>
    ipcRenderer.invoke('route:getPaginatedRoutes', params),

  // ============================VENDOR===================================================
  getVendors: (): Promise<VendoreResponseDto[]> => ipcRenderer.invoke('vendor:getVendors'),
  getVendorsByRoute: (routeCode: String): Promise<VendoreResponseDto[]> =>
    ipcRenderer.invoke('vendor:getVendorsByRoute', routeCode),
  getPaginatedVendors: (params: PaginationRequestDto): Promise<PaginatedVendorsDto> =>
    ipcRenderer.invoke('vendor:getPaginatedVendors', params),

  // =============================SUPERVISOR========================
  getSupervisors: (): Promise<SupervisorResponseDto[]> =>
    ipcRenderer.invoke('supervisor:getSupervisors'),
  getPaginatedSupervisors: (params: PaginationRequestDto): Promise<PaginatedSupervisorDto> =>
    ipcRenderer.invoke('supervisor:getPaginatedSupervisors', params),

  // ===============================MASTER=======================
  getReasons: (): Promise<ReasonDto[]> => ipcRenderer.invoke('master:getReasons'),
  getDashboardCount: (): Promise<DashboardCountDto> =>
    ipcRenderer.invoke('master:getDashboardCount'),
  getWeightSystems: (): Promise<WeightSystemDto[]> => ipcRenderer.invoke('master:getWeightSystems'),
  getCanTypes: (): Promise<CansTypeDto[]> => ipcRenderer.invoke('master:getCanTypes'),
  getMilkStatus: (): Promise<MilkStatusDto[]> => ipcRenderer.invoke('master:getMilkStatus'),
  getMilkType: (): Promise<MilkTypesDto[]> => ipcRenderer.invoke('master:getMilkType'),
  getShifts: (): Promise<ShiftDto[]> => ipcRenderer.invoke('master:getShifts'),

  getLastSampleDate: (): Promise<LastSampleDateDto> =>
    ipcRenderer.invoke('master:getLastSampleDate'),
  getLastSynckedMaster: (masterName: string): Promise<LastSynckedMasterDto> =>
    ipcRenderer.invoke('master:getLastSynckedMaster', masterName),

  getLastSynckedMilkCollection: (): Promise<LastSynckedMilkCollectionDto> =>
    ipcRenderer.invoke('master:getLastSynckedMilkCollection'),
  getLastSynckedMilkRejection: (): Promise<LastSynckedMilkRejectionDto> =>
    ipcRenderer.invoke('master:getLastSynckedMilkRejection'),

  // ===============================REPORT===========================================
  getPeriodicReport: (fromDate: string, toDate: string): Promise<PeriodicReportDto[]> =>
    ipcRenderer.invoke('report:getPeriodicReport', fromDate, toDate),
  getTruckSheetReport: (
    params: PaginationRequestDto,
    shift?: number,
    date?: string,
    isAnalyse?: number,
    routeCode?: string,
    vendorCode?: string
  ): Promise<PaginatedMilkCollectionDto> =>
    ipcRenderer.invoke(
      'report:getTruckSheetReport',
      params,
      shift,
      date,
      isAnalyse,
      routeCode,
      vendorCode
    ),

  // ==============================MILK COLLECTION===============================
  getPaginatedMilkCollctions: (
    params: PaginationRequestDto,
    shift?: number,
    date?: string,
    isAnalyse?: number
  ): Promise<PaginatedMilkCollectionDto> =>
    ipcRenderer.invoke(
      'procurement-collection:getPaginatedMilkCollctions',
      params,
      shift,
      date,
      isAnalyse
    ),
  saveMilkCollection: (params: SaveMilkCollectionDto): Promise<MilkCollectionDto> =>
    ipcRenderer.invoke('procurement-collection:saveMilkCollection', params),
  getMilkCollections: (date: string, shift: number): Promise<MilkCollectionDto[]> =>
    ipcRenderer.invoke('procurement-collection:getMilkCollections', date, shift),

  // ==================================MILK ANALYSIS==========================
  getMilkSamples: (sampleDate: string, shift: number, plant: string): Promise<MilkSampleDto[]> =>
    ipcRenderer.invoke('procurement-analysis:getMilkSamples', sampleDate, shift, plant),

  updateMilkSample: (params: MilkSampleUpdateDto): Promise<MilkSampleDto> =>
    ipcRenderer.invoke('procurement-analysis:updateMilkSample', params),

  // ===============================MILK REJECTION======================
  getPaginatedMilkRejections: (
    params: PaginationRequestDto,
    shift?: string | number,
    date?: string
  ): Promise<PaginatedMilkRejectionDto> =>
    ipcRenderer.invoke('procurement-rejection:getPaginatedMilkRejections', params, shift, date),
  saveMilkRejection: (params: MilkRejectionSaveDto): Promise<MilkRejectionResponseDto> =>
    ipcRenderer.invoke('procurement-rejection:saveMilkRejection', params),

  // ==========================TRANSPORT======================
  getPaginatedTransports: (
    params: PaginationRequestDto,
    fromDate?: string,
    toDate?: string
  ): Promise<PaginatedTransportDto> =>
    ipcRenderer.invoke('transport:getPaginatedTransports', params, fromDate, toDate),
  saveTransport: (params: TransportSaveDto): Promise<TransportDto> =>
    ipcRenderer.invoke('transport:saveTransport', params),

  // ============================================SERIAL PORT==================
  getSerialPorts: (): Promise<PortListItem[]> => ipcRenderer.invoke('serial:list'),
  connectSerial: (cfg: PortConfig): Promise<SerialResult> =>
    ipcRenderer.invoke('serial:connect', cfg),
  disconnectSerial: (path: string): Promise<SerialResult> =>
    ipcRenderer.invoke('serial:disconnect', path),
  getSnapshot: (): Promise<SerialSnapshot> => ipcRenderer.invoke('serial:snapshot'),
  clearSerialReadings: (keys?: string[]): Promise<void> => ipcRenderer.invoke('serial:clear', keys),

  // live updates (main pushes on 'serial:update'); returns a function that stops listening
  onSerialSnapshot: (cb: (s: SerialSnapshot) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, s: SerialSnapshot) => cb(s)
    ipcRenderer.on('serial:update', handler)
    return () => ipcRenderer.removeListener('serial:update', handler)
  },

  // network check (runs in main process so renderer DevTools does not log ERR_NAME_NOT_RESOLVED)
  checkInternet: (): Promise<boolean> => ipcRenderer.invoke('network:checkInternet')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
