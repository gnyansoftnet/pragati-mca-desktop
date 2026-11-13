import { ipcMain } from 'electron'
import { container } from '../../core/di/container'
import { PaginationRequestDto } from '../../../shared/dtos/pagination.dto'
import { IRouteService } from './services/i-route.service'
import { TOKENS } from '../../core/di/token'

export function registerRouteIpc(): void {
  const routeService = container.resolve<IRouteService>(TOKENS.RouteService)
  ipcMain.handle('route:getRoutes', () => routeService.getRoutes())

  ipcMain.handle('route:getPaginatedRoutes', (_event, params: PaginationRequestDto) =>
    routeService.getPaginatedRoutes(params)
  )
}
