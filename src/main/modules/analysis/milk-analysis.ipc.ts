import { ipcMain } from 'electron'
import { container } from '../../core/di/container'
import { UpdateMilkCollectionDto } from './dtos/milk-analysis-update.dto'
import { MilkAnalysisService } from './service/milk-analysis.service'

const service = container.resolve(MilkAnalysisService)

export function registerMilkAnalysisIpc(): void {
  ipcMain.handle('milk-analysis:updateMilkAnalysis', (_event, params: UpdateMilkCollectionDto) =>
    service.updateMilkAnalysis(params)
  )
}
