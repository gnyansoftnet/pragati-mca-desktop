import { ipcMain } from 'electron'
import { container } from '../../core/di/container'
import { PaginationRequestDto } from '../../../shared/dtos/pagination.dto'
import { MilkCollectionService } from './services/milk-collection.service'
import { SaveMilkCollectionDto } from '../../../shared/dtos/milk-collection/milk-collection-save.dt'

const service = container.resolve(MilkCollectionService)

export function registerMilkCollectionIpc(): void {
  ipcMain.handle(
    'milk-collection:getPaginatedMilkCollctions',
    (_event, params: PaginationRequestDto) => service.getPaginatedMilkCollctions(params)
  )

  ipcMain.handle('milk-collection:getWeightSystems', () => service.getWeightSystems())

  ipcMain.handle('milk-collection:saveMilkCollection', (_event, params: SaveMilkCollectionDto) =>
    service.saveMilkCollection(params)
  )
}
