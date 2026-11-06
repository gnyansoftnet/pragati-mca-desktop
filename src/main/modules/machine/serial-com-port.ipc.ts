import { ipcMain } from 'electron'
import { container } from '../../core/di/container'
import { SerialComPortService } from './service/serial-com-port.service'
import { PortConfig } from '@shared/dtos/connection/serial-com-port.dto'

const service = container.resolve(SerialComPortService)

export function registerSerialIpc(): void {
  ipcMain.handle('serial:list', () => service.listPorts())
  ipcMain.handle('serial:snapshot', () => service.getSnapshot())
  ipcMain.handle('serial:connect', (_e, cfg: PortConfig) => service.connect(cfg))
  ipcMain.handle('serial:disconnect', (_e, path: string) => service.disconnect(path))
  ipcMain.handle('serial:clear', (_e, keys?: string[]) => service.clearReadings(keys))
}
