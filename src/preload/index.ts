import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { PaginationRequestDto } from '../shared/dtos/pagination.dto'
import {
  MilkRejectionResponseDto,
  MilkRejectionSaveDto,
  PaginatedMilkRejectionDto
} from '../shared/dtos/milk-collection/milk-rejection.dto'
import { UserResponseDto } from '@shared/dtos/user/user.dto'
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

  syncUser: (plant: string): Promise<SyncSucess> => ipcRenderer.invoke('user:syncUser', plant),
  usersExist: (): Promise<boolean> => ipcRenderer.invoke('user:usersExist'),

  // routes
  getRoutes: (): Promise<RouteResponseDto[]> => ipcRenderer.invoke('route:getRoutes'),
  syncRoutes: (plant: string, org: string, branch: string): Promise<SyncSucess> =>
    ipcRenderer.invoke('route:syncRoutes', plant, org, branch),
  getPaginatedRoutes: (params: PaginationRequestDto): Promise<PaginatedRoutesDto> =>
    ipcRenderer.invoke('route:getPaginatedRoutes', params),

  // vendor
  getVendors: (): Promise<VendoreResponseDto[]> => ipcRenderer.invoke('vendor:getVendors'),
  syncVendors: (plant: string, org: string, branch: string): Promise<SyncSucess> =>
    ipcRenderer.invoke('vendor:syncVendors', plant, org, branch),
  getVendorsByRoute: (routeCode: String): Promise<VendoreResponseDto[]> =>
    ipcRenderer.invoke('vendor:getVendorsByRoute', routeCode),
  getPaginatedVendors: (params: PaginationRequestDto): Promise<PaginatedVendorsDto> =>
    ipcRenderer.invoke('vendor:getPaginatedVendors', params),

  getSupervisors: (): Promise<SupervisorResponseDto[]> =>
    ipcRenderer.invoke('supervisor:getSupervisors'),
  syncSupervisors: (plant: string, org: string, branch: string): Promise<SyncSucess> =>
    ipcRenderer.invoke('supervisor:syncSupervisors', plant, org, branch),
  getPaginatedSupervisors: (params: PaginationRequestDto): Promise<PaginatedSupervisorDto> =>
    ipcRenderer.invoke('supervisor:getPaginatedSupervisors', params),

  // milk
  getPaginatedMilkCollctions: (
    params: PaginationRequestDto,
    fromDate?: string,
    toDate?: string
  ): Promise<PaginatedMilkCollectionDto> =>
    ipcRenderer.invoke('milk-collection:getPaginatedMilkCollctions', params, fromDate, toDate),
  saveMilkCollection: (params: SaveMilkCollectionDto): Promise<MilkCollectionDto> =>
    ipcRenderer.invoke('milk-collection:saveMilkCollection', params),
  getWeightSystems: (): Promise<WeightSystemDto[]> =>
    ipcRenderer.invoke('milk-collection:getWeightSystems'),

  getMilkCollections: (): Promise<MilkCollectionDto[]> =>
    ipcRenderer.invoke('milk-collection:getMilkCollections'),

  // milk analysis
  getMilkSamples: (sampleDate: string, shift: number, plant: string): Promise<MilkSampleDto[]> =>
    ipcRenderer.invoke('milk-analysis:getMilkSamples', sampleDate, shift, plant),

  updateMilkSample: (params: MilkSampleUpdateDto): Promise<MilkSampleDto> =>
    ipcRenderer.invoke('milk-analysis:updateMilkSample', params),

  // milk rejection
  getReasons: (): Promise<MilkRejectionResponseDto[]> =>
    ipcRenderer.invoke('milk-rejection:getReasons'),
  getPaginatedMilkRejections: (params: PaginationRequestDto): Promise<PaginatedMilkRejectionDto> =>
    ipcRenderer.invoke('milk-rejection:getPaginatedMilkRejections', params),
  saveMilkRejection: (params: MilkRejectionSaveDto): Promise<MilkRejectionResponseDto> =>
    ipcRenderer.invoke('milk-rejection:saveMilkRejection', params),

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
  }
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
