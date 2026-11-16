import { injectable } from 'tsyringe'
import { IMasterRepo } from '../i-master.repo'
import {
  CansTypeRow,
  MilkStatusRow,
  MilkTypeRow,
  ReasonRow,
  ShiftRow,
  WeightSystemRow
} from '../../dto/master.row'
import { db } from '../../../../core/config/database.config'

const SQL_GET_REASONS = `
  SELECT id, reason
    FROM rejection_reason
   ORDER BY id ASC`

const SQL_GET_WEIGHT_SYSTEMS = `
  SELECT id, system_list
    FROM weight_system_list
   ORDER BY id ASC`

const SQL_GET_CAN_TYPES = `
  SELECT id, can_name
    FROM cans_type
   ORDER BY id ASC`

const SQL_GET_MILK_TYPES = `
  SELECT id, milk_type
    FROM milk_type
   ORDER BY id ASC`

const SQL_GET_MILK_STATUS = `
  SELECT id, milk_status
    FROM milk_status
   ORDER BY id ASC`

const SQL_GET_SHIFT = `
  SELECT *
    FROM shift
   ORDER BY id ASC`

@injectable()
export class MasterRepo implements IMasterRepo {
  constructor() {}

  async getCanTypes(): Promise<CansTypeRow[]> {
    const [rows] = await db.execute<CansTypeRow[]>(SQL_GET_CAN_TYPES)
    return rows
  }
  async getShifts(): Promise<ShiftRow[]> {
    const [rows] = await db.execute<ShiftRow[]>(SQL_GET_SHIFT)
    return rows
  }
  async getMilkStatus(): Promise<MilkStatusRow[]> {
    const [rows] = await db.execute<MilkStatusRow[]>(SQL_GET_MILK_STATUS)
    return rows
  }
  async getMilkType(): Promise<MilkTypeRow[]> {
    const [rows] = await db.execute<MilkTypeRow[]>(SQL_GET_MILK_TYPES)
    return rows
  }
  async getReasons(): Promise<ReasonRow[]> {
    const [rows] = await db.execute<ReasonRow[]>(SQL_GET_REASONS)
    return rows
  }
  async getWeightSystems(): Promise<WeightSystemRow[]> {
    const [rows] = await db.execute<WeightSystemRow[]>(SQL_GET_WEIGHT_SYSTEMS)
    return rows
  }
}
