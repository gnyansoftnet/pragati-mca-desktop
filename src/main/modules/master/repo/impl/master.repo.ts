import { injectable } from 'tsyringe'
import { IMasterRepo } from '../i-master.repo'
import {
  CansTypeRow,
  DashboardCountRow,
  LastSampleDateRow,
  LastSynckedMasterRow,
  LastSynckedMilkCollectionRow,
  LastSynckedMilkRejectionRow,
  MilkStatusRow,
  MilkTypeRow,
  ReasonRow,
  ShiftRow,
  WeightSystemRow
} from '../../dto/master.row'
import { db } from '../../../../core/config/database.config'
import { DatabaseError } from '../../../../utils/app-errors'

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
  async getLastSynckedMilkCollection(): Promise<LastSynckedMilkCollectionRow> {
    try {
      const [rows] = await db.execute<LastSynckedMilkCollectionRow[]>(
        `SELECT id, lastSycfrom, lastSyncTo 
       FROM milk_collection_sync_log 
       ORDER BY lastSyncTo DESC 
       LIMIT 1`
      )
      return rows[0] ?? null
    } catch (error: any) {
      throw new DatabaseError(
        error.sqlMessage || error.message || 'Failed to fetch last syncked date',
        {
          cause: error
        }
      )
    }
  }
  async getLastSynckedMilkRejection(): Promise<LastSynckedMilkRejectionRow> {
    try {
      const [rows] = await db.execute<LastSynckedMilkRejectionRow[]>(
        `SELECT id, lastSycfrom, lastSyncTo 
       FROM milk_rejection_sync_log 
       ORDER BY lastSyncTo DESC 
       LIMIT 1`
      )
      return rows[0]
    } catch (error: any) {
      throw new DatabaseError(
        error.sqlMessage || error.message || 'Failed to fetch last syncked date',
        {
          cause: error
        }
      )
    }
  }

  async getLastSynckedMaster(masterName: string): Promise<LastSynckedMasterRow> {
    try {
      const [rows] = await db.execute<LastSynckedMasterRow[]>(
        `SELECT * FROM master_sync_log WHERE master_name = ? LIMIT 1`,
        [masterName]
      )
      return rows[0] ?? null
    } catch (error: any) {
      throw new DatabaseError(
        error.sqlMessage || error.message || 'Failed to fetch last synced master',
        {
          cause: error
        }
      )
    }
  }

  async getLastSampleDate(): Promise<LastSampleDateRow> {
    try {
      const [rows] = await db.execute<LastSampleDateRow[]>(
        `SELECT MAX(sample_date) AS last_sample_date 
      FROM milk_collection_details `
      )
      return rows[0]
    } catch (error: any) {
      throw new DatabaseError(
        error.sqlMessage || error.message || 'Failed to fetch last sample date',
        {
          cause: error
        }
      )
    }
  }

  async getDashboardCount(): Promise<DashboardCountRow> {
    const [rows] = await db.execute<DashboardCountRow[]>(
      `SELECT
      (SELECT COUNT(*) FROM milk_collection_details WHERE sample_date = CURDATE() ) AS collection,
       (SELECT COUNT(*) FROM milk_collection_details WHERE is_analyse = 1) AS \`analyze\`,
       (SELECT COUNT(*) FROM rejection_milk) AS rejected,
      (SELECT COUNT(*) FROM vendor) AS vendor,
      (SELECT COUNT(*) FROM route) AS route,
      (SELECT COUNT(*) FROM supervisor) AS supervisor,
      (SELECT COUNT(*) FROM \`user\`) AS user`
    )
    return rows[0]
  }

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
