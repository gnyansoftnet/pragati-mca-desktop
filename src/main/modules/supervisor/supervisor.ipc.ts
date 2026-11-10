import { ipcMain } from 'electron'
import { container } from '../../core/di/container'
import { PaginationRequestDto } from '../../../shared/dtos/pagination.dto'
import { SupervisorService } from './service/supervisor.service'
import { SyncSucess } from '@shared/dtos/sync-success.dto'

const service = container.resolve(SupervisorService)

export function registerSupervisorIpc(): void {
  ipcMain.handle('supervisor:getSupervisors', () => service.getSupervisors())
  ipcMain.handle(
    'supervisor:syncSupervisors',
    (_event, plant: string, org: string, branch: string): Promise<SyncSucess> =>
      service.saveSupervisor(plant, org, branch)
  )

  ipcMain.handle('supervisor:getPaginatedSupervisors', (_event, params: PaginationRequestDto) =>
    service.getPaginatedSupervisors(params)
  )
}
