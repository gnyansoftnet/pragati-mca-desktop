import { ipcMain } from 'electron'
import { container } from '../../core/di/container'

import { PaginationRequestDto } from '../../../shared/dtos/pagination.dto'
import type { IVendorService } from './services/i-vendor.service'
import { TOKENS } from '../../core/di/token'

export function registerVendorIpc(): void {
  const vendorService = container.resolve<IVendorService>(TOKENS.VendorService)
  ipcMain.handle('vendor:getVendors', () => vendorService.getVendors())

  ipcMain.handle('vendor:getVendorsByRoute', (_event, routeCode: string) =>
    vendorService.getVendorsByRoute(routeCode)
  )
  ipcMain.handle('vendor:getPaginatedVendors', (_event, params: PaginationRequestDto) =>
    vendorService.getPaginatedVendors(params)
  )
}
