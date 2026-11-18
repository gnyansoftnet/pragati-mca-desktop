import {
  CansTypeRow,
  DashboardCountRow,
  LastSampleDateRow,
  LastSynckedMasterRow,
  MilkStatusRow,
  MilkTypeRow,
  ReasonRow,
  ShiftRow,
  WeightSystemRow
} from '../dto/master.row'

export interface IMasterRepo {
  getReasons(): Promise<ReasonRow[]>
  getWeightSystems(): Promise<WeightSystemRow[]>
  getCanTypes(): Promise<CansTypeRow[]>
  getShifts(): Promise<ShiftRow[]>
  getMilkStatus(): Promise<MilkStatusRow[]>
  getMilkType(): Promise<MilkTypeRow[]>
  getDashboardCount(): Promise<DashboardCountRow>
  getLastSampleDate(): Promise<LastSampleDateRow>
  getLastSynckedMaster(masterName: string): Promise<LastSynckedMasterRow>
}
