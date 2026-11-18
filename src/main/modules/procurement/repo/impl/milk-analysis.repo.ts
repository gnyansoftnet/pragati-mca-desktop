import { injectable } from 'tsyringe'
import { db } from '../../../../core/config/database.config'
import { MilkSampleUpdateDto } from '@shared/dtos/milk-collection/milk-sample.dto'
import { MilkSampleRow } from '../../dto/milk-analysis.row'
import { IMilkAnalysisRepo } from '../i-milk-analysis.repo'
import {
  AppError,
  DatabaseError,
  NotFoundError,
  ValidationError
} from '../../../../utils/app-errors'
import { RowDataPacket } from 'mysql2'

const SQL_GET_MILK_SAMPLES = `
  SELECT id, trans_code, plant, shift, sample_date, sample_code,
         net_weight, fat, snf, is_analyse
    FROM milk_collection_details
   WHERE sample_date = ?
     AND shift = ?
     AND plant = ?
     AND d_flag = 0
     AND is_analyse=0
   ORDER BY sample_code ASC`

const USP_M_MILK_SAMPLE_UPDATE = 'CALL USP_M_MILK_SAMPLE_UPDATE(?,?,?,?,?,?)'

@injectable()
export class MilkAnalysisRepo implements IMilkAnalysisRepo {
  constructor() {}

  async getMilkSamples(sampleDate: string, shift: number, plant: string): Promise<MilkSampleRow[]> {
    const [rows] = await db.execute<MilkSampleRow[]>(SQL_GET_MILK_SAMPLES, [
      sampleDate,
      shift,
      plant
    ])
    return rows
  }

  async updateMilkSample(data: MilkSampleUpdateDto): Promise<MilkSampleRow> {
    try {
      const [rows] = await db.query<RowDataPacket[][]>(USP_M_MILK_SAMPLE_UPDATE, [
        data.sampleDate,
        data.shift,
        data.plant,
        data.sampleCode,
        data.fat ?? null,
        data.snf ?? null
      ])
      // In mysql2 for stored procedures: rows[0][0] is the returned record
      const updatedRow = rows?.[0]?.[0]
      if (!updatedRow) {
        throw new NotFoundError(
          `Milk sample not found for Date: ${data.sampleDate}, Shift: ${data.shift}, Sample: #${data.sampleCode}`
        )
      }
      return updatedRow as unknown as MilkSampleRow
    } catch (error: any) {
      // 1. Pass through domain errors (e.g., NotFoundError)
      if (error instanceof AppError) {
        throw error
      }
      // 2. MySQL SIGNAL SQLSTATE '45000' (Business validation errors)
      if (error?.sqlState === '45000' || error?.errno === 1644) {
        throw new ValidationError(error.sqlMessage || error.message || 'Validation failed')
      }
      // 3. Fallback for unexpected database errors
      const message = error?.sqlMessage || error?.message || 'Failed to update milk sample'
      throw new DatabaseError(message, { cause: error })
    }
  }
}
