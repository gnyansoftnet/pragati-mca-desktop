import { ipcMain } from 'electron'
import { container } from '../../core/di/container'
import { SerialService } from './service/serial.service'

const service = container.resolve(SerialService)

export function registerSerialIpc(): void {
  ipcMain.handle('serial:list', () => service.listPorts())

  ipcMain.handle('serial:connect', (_e, p) =>
    service.connect(p.path, p.baudRate, p.parity, p.dataBits, p.stopBits)
  )

  ipcMain.handle('serial:disconnect', () => service.disconnect())
}
