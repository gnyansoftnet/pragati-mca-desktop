import { ipcMain } from 'electron'
import { TOKENS } from '../../core/di/token'
import { container } from 'tsyringe'
import { MilkSampleUpdateDto } from '@shared/dtos/milk-collection/milk-sample.dto'
import { IMilkAnalysisService } from './service/i-milk-analysis.service'
import { IMilkCollectionService } from './service/i-milk-collection.service'
import { SaveMilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection.dto'
import { WeightSystemDto } from '@shared/dtos/milk-collection/weight-system.dto'
import { PaginationRequestDto } from '@shared/dtos/pagination.dto'
import { IMilkRejectionService } from './service/i-milk-rejection.service'
import { MilkRejectionSaveDto } from '@shared/dtos/milk-collection/milk-rejection.dto'

export function registerProcurmentIpc(): void {
  const analysisService = container.resolve<IMilkAnalysisService>(TOKENS.MilkAnalysisService)
  const collectionService = container.resolve<IMilkCollectionService>(TOKENS.MilkCollectionService)
  const rejectionService = container.resolve<IMilkRejectionService>(TOKENS.MilkRejectionService)

  ipcMain.handle(
    'procurement-analysis:getMilkSamples',
    (_event, sampleDate: string, shift: number, plant: string) =>
      analysisService.getMilkSamples(sampleDate, shift, plant)
  )
  ipcMain.handle('procurement-analysis:updateMilkSample', (_event, params: MilkSampleUpdateDto) =>
    analysisService.updateMilkSample(params)
  )

  ipcMain.handle(
    'procurement-collection:getPaginatedMilkCollctions',
    (
      _event,
      params: PaginationRequestDto,
      fromDate?: string,
      toDate?: string,
      isAnalyse?: number
    ) => collectionService.getPaginatedMilkCollections(params, fromDate, toDate, isAnalyse)
  )

  ipcMain.handle('milk-collection:getWeightSystems', () => collectionService.getWeightSystems())
  ipcMain.handle(
    'procurement-collection:saveWeightSystem',
    (_event, systemList: string, userCode: string): Promise<WeightSystemDto> =>
      collectionService.saveWeightSystem(systemList, userCode)
  )

  ipcMain.handle('procurement-collection:getMilkCollections', () =>
    collectionService.getMilkCollections()
  )

  ipcMain.handle(
    'procurement-collection:saveMilkCollection',
    (_event, params: SaveMilkCollectionDto) => collectionService.saveMilkCollection(params)
  )

  ipcMain.handle(
    'procurement-rejection:getPaginatedMilkRejections',
    (_event, params: PaginationRequestDto) => rejectionService.getPaginatedMilkRejections(params)
  )

  ipcMain.handle('procurement-rejection:getReasons', () => rejectionService.getReasons())

  ipcMain.handle(
    'procurement-rejection:saveMilkRejection',
    (_event, params: MilkRejectionSaveDto) => rejectionService.saveMilkRejection(params)
  )
}
