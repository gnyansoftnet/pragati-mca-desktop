import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { PaginationRequestDto } from '../main/utils/pagination.dto'
import { SaveMilkCollectionDto } from '../main/modules/milk_collection/dtos/milk-collection-save.dt'
import { UpdateMilkCollectionDto } from '../main/modules/analysis/dtos/milk-analysis-update.dto'
import { subscribe } from 'diagnostics_channel'
import { MilkRejectionSaveDto } from '../main/modules/milk_rejection/dtos/milk-rejection.dto'

// Custom APIs for renderer

const api = {
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
  getSerialPorts: () => ipcRenderer.invoke('serial:list'),
  connectSerial: (params: {
    path: string
    baudRate: number
    parity: string
    dataBits: number
    stopBits: number
  }) => ipcRenderer.invoke('serial:connect', params),
  disconnectSerial: () => ipcRenderer.invoke('serial:disconnect')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
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
