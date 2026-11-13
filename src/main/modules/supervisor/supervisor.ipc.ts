import { ipcMain } from 'electron'
import { container } from '../../core/di/container'
import { PaginationRequestDto } from '../../../shared/dtos/pagination.dto'
import { ISupervisorService } from './service/i-supervisor.service'
import { TOKENS } from '../../core/di/token'

export function registerSupervisorIpc(): void {
  const superService = container.resolve<ISupervisorService>(TOKENS.SupervisorService)
  ipcMain.handle('supervisor:getSupervisors', () => superService.getSupervisors())

  ipcMain.handle('supervisor:getPaginatedSupervisors', (_event, params: PaginationRequestDto) =>
    superService.getPaginatedSupervisors(params)
  )
}
