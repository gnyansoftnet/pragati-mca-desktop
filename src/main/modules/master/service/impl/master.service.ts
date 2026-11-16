import { ReasonDto } from '@shared/dtos/milk-collection/milk-rejection.dto'
import { IMasterService } from '../i-master.service'
import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../../../core/di/token'
import type { IMasterRepo } from '../../repo/i-master.repo'
import { AppError, DatabaseError } from '../../../../utils/app-errors'
import {
  CansTypeDto,
  MilkStatusDto,
  MilkTypesDto,
  ShiftDto,
  WeightSystemDto
} from '@shared/dtos/master/master.dto'
import { CansTypeRow, MilkStatusRow, MilkTypeRow, ShiftRow } from '../../dto/master.row'

@injectable()
export class MasterService implements IMasterService {
  constructor(
    @inject(TOKENS.MasterRepo)
    private readonly masterRepo: IMasterRepo
  ) {}

  async getCanTypes(): Promise<CansTypeDto[]> {
    try {
      const rows: CansTypeRow[] = await this.masterRepo.getCanTypes()
      return rows.map((r) => ({
        id: r.id,
        cansType: r.cans_type
      }))
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch weight systems', { cause: error })
    }
  }
  async getShifts(): Promise<ShiftDto[]> {
    try {
      const rows: ShiftRow[] = await this.masterRepo.getShifts()
      return rows.map((r) => ({
        id: r.id,
        shiftName: r.shift_name,
        startTime: r.start_time,
        endTime: r.end_time
      }))
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch shift', { cause: error })
    }
  }
  async getMilkStatus(): Promise<MilkStatusDto[]> {
    try {
      const rows: MilkStatusRow[] = await this.masterRepo.getMilkStatus()
      return rows.map((r) => ({
        id: r.id,
        milkStatus: r.milk_status
      }))
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch milk status', { cause: error })
    }
  }
  async getMilkType(): Promise<MilkTypesDto[]> {
    try {
      const rows: MilkTypeRow[] = await this.masterRepo.getMilkType()
      return rows.map((r) => ({
        id: r.id,
        milkType: r.milk_type
      }))
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch milk type', { cause: error })
    }
  }

  async getReasons(): Promise<ReasonDto[]> {
    try {
      const rows = await this.masterRepo.getReasons()
      return rows.map((r) => ({
        id: r.id,
        reason: r.reason
      }))
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch rejection reasons', { cause: error })
    }
  }

  async getWeightSystems(): Promise<WeightSystemDto[]> {
    try {
      const rows = await this.masterRepo.getWeightSystems()
      return rows.map((r) => ({
        id: r.id,
        systemList: r.system_list
      }))
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch weight systems', { cause: error })
    }
  }
}
