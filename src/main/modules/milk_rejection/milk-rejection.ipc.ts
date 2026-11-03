import { ipcMain } from 'electron'
import { container } from '../../core/di/container'
import { PaginationRequestDto } from '../../../shared/dtos/pagination.dto'
import { MilkRejectionService } from './service/milk-rejection.service'
import { MilkRejectionSaveDto } from '../../../shared/dtos/milk-rejection/milk-rejection.dto'

const service = container.resolve(MilkRejectionService)

export function registerMilkRejectionIpc(): void {
  ipcMain.handle(
    'milk-rejection:getPaginatedMilkRejections',
    (_event, params: PaginationRequestDto) => service.getPaginatedMilkRejections(params)
  )

  ipcMain.handle('milk-rejection:getReasons', () => service.getReasons())

  ipcMain.handle('milk-collection:saveMilkRejection', (_event, params: MilkRejectionSaveDto) =>
    service.saveMilkRejection(params)
  )
}
