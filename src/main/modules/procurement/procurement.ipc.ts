import { ipcMain } from 'electron'
import { TOKENS } from '../../core/di/token'
import { container } from 'tsyringe'
import { MilkSampleUpdateDto } from '@shared/dtos/milk-collection/milk-sample.dto'
import { IMilkAnalysisService } from './service/i-milk-analysis.service'
import { IMilkCollectionService } from './service/i-milk-collection.service'
import { SaveMilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection.dto'
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
    (_event, params: PaginationRequestDto, shift?: number, date?: string, isAnalyse?: number) =>
      collectionService.getPaginatedMilkCollections(params, shift, date, isAnalyse)
  )

  ipcMain.handle(
    'procurement-collection:getMilkCollections',
    (_event, date: string, shift: number) => collectionService.getMilkCollections(date, shift)
  )

  ipcMain.handle(
    'procurement-collection:saveMilkCollection',
    (_event, params: SaveMilkCollectionDto) => collectionService.saveMilkCollection(params)
  )

  ipcMain.handle(
    'procurement-rejection:getPaginatedMilkRejections',
    (_event, params: PaginationRequestDto, shift?: string | number, date?: string) =>
      rejectionService.getPaginatedMilkRejections(params, shift, date)
  )

  ipcMain.handle(
    'procurement-rejection:saveMilkRejection',
    (_event, params: MilkRejectionSaveDto) => rejectionService.saveMilkRejection(params)
  )
}
