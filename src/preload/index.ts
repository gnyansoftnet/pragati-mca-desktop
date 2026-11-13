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
import { WeightSystemDto } from '@shared/dtos/milk-collection/weight-system.dto'
import { SyncSucess } from '@shared/dtos/sync-success.dto'

// Custom APIs for renderer

const api = {
  // user
  login: (userName: string, password: string): Promise<UserResponseDto> =>
    ipcRenderer.invoke('user:login', userName, password),

  // sync
  syncRoutes: (plant: string, org: string, branch: string): Promise<SyncSucess> =>
    ipcRenderer.invoke('route-sync:syncRoutes', plant, org, branch),
  syncVendors: (plant: string, org: string, branch: string): Promise<SyncSucess> =>
    ipcRenderer.invoke('vendor-sync:syncVendors', plant, org, branch),
  syncSupervisors: (plant: string, org: string, branch: string): Promise<SyncSucess> =>
    ipcRenderer.invoke('supervisor-sync:syncSupervisors', plant, org, branch),

  syncUser: (plant: string, intial: string): Promise<SyncSucess> =>
    ipcRenderer.invoke('user:syncUser', plant, intial),
  usersExist: (): Promise<boolean> => ipcRenderer.invoke('user:usersExist'),
  getPaginatedUsers: (params: PaginationRequestDto): Promise<PaginatedUsersDto> =>
    ipcRenderer.invoke('user:getPaginatedUsers', params),

  // routes
  getRoutes: (): Promise<RouteResponseDto[]> => ipcRenderer.invoke('route:getRoutes'),
  getPaginatedRoutes: (params: PaginationRequestDto): Promise<PaginatedRoutesDto> =>
    ipcRenderer.invoke('route:getPaginatedRoutes', params),

  // vendor
  getVendors: (): Promise<VendoreResponseDto[]> => ipcRenderer.invoke('vendor:getVendors'),
  getVendorsByRoute: (routeCode: String): Promise<VendoreResponseDto[]> =>
    ipcRenderer.invoke('vendor:getVendorsByRoute', routeCode),
  getPaginatedVendors: (params: PaginationRequestDto): Promise<PaginatedVendorsDto> =>
    ipcRenderer.invoke('vendor:getPaginatedVendors', params),

  getSupervisors: (): Promise<SupervisorResponseDto[]> =>
    ipcRenderer.invoke('supervisor:getSupervisors'),
  getPaginatedSupervisors: (params: PaginationRequestDto): Promise<PaginatedSupervisorDto> =>
    ipcRenderer.invoke('supervisor:getPaginatedSupervisors', params),

  // procurement
  getPaginatedMilkCollctions: (
    params: PaginationRequestDto,
    fromDate?: string,
    toDate?: string
  ): Promise<PaginatedMilkCollectionDto> =>
    ipcRenderer.invoke(
      'procurement-collection:getPaginatedMilkCollctions',
      params,
      fromDate,
      toDate
    ),
  saveMilkCollection: (params: SaveMilkCollectionDto): Promise<MilkCollectionDto> =>
    ipcRenderer.invoke('procurement-collection:saveMilkCollection', params),
  getMilkCollections: (): Promise<MilkCollectionDto[]> =>
    ipcRenderer.invoke('procurement-collection:getMilkCollections'),

  // weight system
  getWeightSystems: (): Promise<WeightSystemDto[]> =>
    ipcRenderer.invoke('procurement-collection:getWeightSystems'),
  saveWeightSystem: (systemList: string, userCode: string): Promise<WeightSystemDto> =>
    ipcRenderer.invoke('procurement-collection:saveWeightSystem', systemList, userCode),

  // milk analysis
  getMilkSamples: (sampleDate: string, shift: number, plant: string): Promise<MilkSampleDto[]> =>
    ipcRenderer.invoke('procurement-analysis:getMilkSamples', sampleDate, shift, plant),

  updateMilkSample: (params: MilkSampleUpdateDto): Promise<MilkSampleDto> =>
    ipcRenderer.invoke('procurement-analysis:updateMilkSample', params),

  // milk rejection
  getReasons: (): Promise<MilkRejectionResponseDto[]> =>
    ipcRenderer.invoke('procurement-rejection:getReasons'),
  getPaginatedMilkRejections: (params: PaginationRequestDto): Promise<PaginatedMilkRejectionDto> =>
    ipcRenderer.invoke('procurement-rejection:getPaginatedMilkRejections', params),
  saveMilkRejection: (params: MilkRejectionSaveDto): Promise<MilkRejectionResponseDto> =>
    ipcRenderer.invoke('procurement-rejection:saveMilkRejection', params),

  // serial port
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
