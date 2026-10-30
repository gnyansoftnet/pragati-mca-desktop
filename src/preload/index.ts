import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { PaginationRequestDto } from '../main/utils/pagination.dto'

// Custom APIs for renderer

const api = {
  // routes
  getRoutes: () => ipcRenderer.invoke('route:getRoutes'),
  getPaginatedRoutes: (params: PaginationRequestDto) =>ipcRenderer.invoke('route:getPaginatedRoutes', params),
  
  // milk
  getPaginatedMilkCollctions: (params: PaginationRequestDto) =>ipcRenderer.invoke('milk-collection:getPaginatedMilkCollctions', params)
 
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