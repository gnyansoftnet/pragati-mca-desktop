import {
  CansTypeDto,
  DashboardCountDto,
  LastSampleDateDto,
  LastSynckedMasterDto,
  MilkStatusDto,
  MilkTypesDto,
  ShiftDto,
  WeightSystemDto
} from '@shared/dtos/master/master.dto'
import { ReasonDto } from '@shared/dtos/milk-collection/milk-rejection.dto'

export interface IMasterService {
  getReasons(): Promise<ReasonDto[]>
  getWeightSystems(): Promise<WeightSystemDto[]>
  getCanTypes(): Promise<CansTypeDto[]>
  getShifts(): Promise<ShiftDto[]>
  getMilkStatus(): Promise<MilkStatusDto[]>
  getMilkType(): Promise<MilkTypesDto[]>
  getDashboardCount(): Promise<DashboardCountDto>
  getLastSampleDate(): Promise<LastSampleDateDto>
  getLastSynckedMaster(masterName: string): Promise<LastSynckedMasterDto>
}
