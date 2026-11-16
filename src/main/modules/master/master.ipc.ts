import { ipcMain } from 'electron'
import { TOKENS } from '../../core/di/token'
import { container } from 'tsyringe'
import { IMasterService } from './service/i-master.service'
import {
  CansTypeDto,
  MilkStatusDto,
  MilkTypesDto,
  ShiftDto,
  WeightSystemDto
} from '@shared/dtos/master/master.dto'
import { ReasonDto } from '@shared/dtos/milk-collection/milk-rejection.dto'

export function registerMasterIpc(): void {
  const masterService = container.resolve<IMasterService>(TOKENS.MasterService)

  ipcMain.handle('master:getReasons', (): Promise<ReasonDto[]> => masterService.getReasons())
  ipcMain.handle('master:getCanTypes', (): Promise<CansTypeDto[]> => masterService.getCanTypes())
  ipcMain.handle('master:getMilkStatus', (): Promise<MilkStatusDto[]> =>
    masterService.getMilkStatus()
  )
  ipcMain.handle('master:getMilkType', (): Promise<MilkTypesDto[]> => masterService.getMilkType())
  ipcMain.handle('master:getShifts', (): Promise<ShiftDto[]> => masterService.getShifts())

  ipcMain.handle('master:getWeightSystems', (): Promise<WeightSystemDto[]> =>
    masterService.getWeightSystems()
  )
}
