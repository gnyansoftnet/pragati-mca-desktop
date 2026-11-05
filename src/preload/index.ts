import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { PaginationRequestDto } from '../shared/dtos/pagination.dto'
import { SaveMilkCollectionDto } from '../shared/dtos/milk-collection/milk-collection-save.dt'
import { UpdateMilkCollectionDto } from '../shared/dtos/analysis/milk-analysis-update.dto'
import { MilkRejectionSaveDto } from '../shared/dtos/milk-rejection/milk-rejection.dto'
import { UserResponseDto } from '@shared/dtos/user/user.dto'
import {
  PortConfig,
  PortListItem,
  SerialResult,
  SerialSnapshot
} from '@shared/dtos/connection/serial-com-port.dto'

// Custom APIs for renderer

const api = {
  // user
  login: (userName: string, password: string): Promise<UserResponseDto> =>
    ipcRenderer.invoke('user:login', userName, password),

  // routes
  getRoutes: () => ipcRenderer.invoke('route:getRoutes'),
  getPaginatedRoutes: (params: PaginationRequestDto) =>
    ipcRenderer.invoke('route:getPaginatedRoutes', params),

  getSupervisors: () => ipcRenderer.invoke('supervisor:getSupervisors'),
  getPaginatedSupervisors: (params: PaginationRequestDto) =>
    ipcRenderer.invoke('supervisor:getPaginatedSupervisors', params),

  // milk
  getPaginatedMilkCollctions: (params: PaginationRequestDto) =>
    ipcRenderer.invoke('milk-collection:getPaginatedMilkCollctions', params),
  saveMilkCollection: (params: SaveMilkCollectionDto) =>
    ipcRenderer.invoke('milk-collection:saveMilkCollection', params),
  getWeightSystems: () => ipcRenderer.invoke('milk-collection:getWeightSystems'),

  // milk analysis
  updateMilkAnalysis: (params: UpdateMilkCollectionDto) =>
    ipcRenderer.invoke('milk-analysis:updateMilkAnalysis', params),

  // vendor
  getVendors: () => ipcRenderer.invoke('vendor:getVendors'),
  getPaginatedVendors: (params: PaginationRequestDto) =>
    ipcRenderer.invoke('vendor:getPaginatedVendors', params),

  // milk rejection
  getReasons: () => ipcRenderer.invoke('milk-rejection:getReasons'),
  getPaginatedMilkRejections: (params: PaginationRequestDto) =>
    ipcRenderer.invoke('milk-rejection:getPaginatedMilkRejections', params),

  saveMilkRejection: (params: MilkRejectionSaveDto) =>
    ipcRenderer.invoke('milk-rejection:saveMilkRejection', params),

  // serial port
  getSerialPorts: (): Promise<PortListItem[]> => ipcRenderer.invoke('serial:list'),
  connectSerial: (cfg: PortConfig): Promise<SerialResult> =>
    ipcRenderer.invoke('serial:connect', cfg),
  disconnectSerial: (path: string): Promise<SerialResult> =>
    ipcRenderer.invoke('serial:disconnect', path),
  getSnapshot: (): Promise<SerialSnapshot> => ipcRenderer.invoke('serial:snapshot'),
  clearSerialReadings: (keys?: string[]): Promise<void> => ipcRenderer.invoke('serial:clear', keys),
  // live updates; returns a function that stops listening
  onSerialSnapshot: (cb: (s: SerialSnapshot) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, s: SerialSnapshot) => cb(s)
    ipcRenderer.on('serial:snapshot', handler)
    return () => ipcRenderer.removeListener('serial:snapshot', handler)
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
