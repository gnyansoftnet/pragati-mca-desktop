import { ipcMain } from 'electron'
import { container } from '../../core/di/container'

import { MilkAnalysisService } from './service/milk-analysis.service'
import { MilkSampleUpdateDto } from '@shared/dtos/milk-collection/milk-sample.dto'

const service = container.resolve(MilkAnalysisService)

export function registerMilkAnalysisIpc(): void {
  ipcMain.handle(
    'milk-analysis:getMilkSamples',
    (_event, sampleDate: string, shift: number, plant: string) =>
      service.getMilkSamples(sampleDate, shift, plant)
  )
  ipcMain.handle('milk-analysis:updateMilkSample', (_event, params: MilkSampleUpdateDto) =>
    service.updateMilkSample(params)
  )
}
