import { ipcMain } from 'electron'
import { container } from '../../core/di/container'
import { PaginationRequestDto } from '../../../shared/dtos/pagination.dto'
import { MilkCollectionService } from './services/milk-collection.service'
import { SaveMilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection.dto'
import { WeightSystemDto } from '@shared/dtos/milk-collection/weight-system.dto'

const service = container.resolve(MilkCollectionService)

export function registerMilkCollectionIpc(): void {
  ipcMain.handle(
    'milk-collection:getPaginatedMilkCollctions',
    (_event, params: PaginationRequestDto, fromDate?: string, toDate?: string) =>
      service.getPaginatedMilkCollections(params, fromDate, toDate)
  )

  ipcMain.handle('milk-collection:getWeightSystems', () => service.getWeightSystems())
  ipcMain.handle(
    'milk-collection:saveWeightSystem',
    (_event, systemList: string, userCode: string): Promise<WeightSystemDto> =>
      service.saveWeightSystem(systemList, userCode)
  )

  ipcMain.handle('milk-collection:getMilkCollections', () => service.getMilkCollections())

  ipcMain.handle('milk-collection:saveMilkCollection', (_event, params: SaveMilkCollectionDto) =>
    service.saveMilkCollection(params)
  )
}
