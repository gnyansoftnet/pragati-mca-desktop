import { ipcMain } from 'electron'
import { container } from '../../core/di/container'
import { RouteService } from './services/route.service'
import { PaginationRequestDto } from '../../../shared/dtos/pagination.dto'

const service = container.resolve(RouteService)

export function registerRouteIpc(): void {
  ipcMain.handle('route:getRoutes', () => service.getRoutes())
  ipcMain.handle('route:syncRoutes', (_event, plant: string, org: string, branch: string) =>
    service.saveRoutes(plant, org, branch)
  )

  ipcMain.handle('route:getPaginatedRoutes', (_event, params: PaginationRequestDto) =>
    service.getPaginatedRoutes(params)
  )
}
