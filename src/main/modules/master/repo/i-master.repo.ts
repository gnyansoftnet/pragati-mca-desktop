import {
  CansTypeRow,
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
}
