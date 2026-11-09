import { ipcMain } from 'electron'
import { container } from '../../core/di/container'
import { VendorService } from './services/vendor-service'
import { PaginationRequestDto } from '../../../shared/dtos/pagination.dto'

const service = container.resolve(VendorService)

export function registerVendorIpc(): void {
  ipcMain.handle('vendor:getVendors', () => service.getVendors())
  ipcMain.handle('vendor:getVendorsByRoute', (_event, routeCode: string) =>
    service.getVendorsByRoute(routeCode)
  )
  ipcMain.handle('vendor:getPaginatedVendors', (_event, params: PaginationRequestDto) =>
    service.getPaginatedVendors(params)
  )
}
