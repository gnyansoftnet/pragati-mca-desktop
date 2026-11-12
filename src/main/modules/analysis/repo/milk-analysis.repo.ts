import { injectable } from 'tsyringe'
import { db } from '../../../core/config/database.config'
import { MilkSampleUpdateDto } from '@shared/dtos/milk-collection/milk-sample.dto'
import { MilkSampleRow } from './milk-analysis.row'

//  AND is_analyse = 0

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
export class MilkAnalysisRepo {
  async getMilkSamples(sampleDate: string, shift: number, plant: string): Promise<MilkSampleRow[]> {
    const [rows] = await db.execute<MilkSampleRow[]>(SQL_GET_MILK_SAMPLES, [
      sampleDate,
      shift,
      plant
    ])
    return rows
  }

  async updateMilkSample(data: MilkSampleUpdateDto): Promise<MilkSampleRow> {
    const [result] = await db.query<MilkSampleRow[]>(USP_M_MILK_SAMPLE_UPDATE, [
      data.sampleDate,
      data.shift,
      data.plant,
      data.sampleCode,
      data.fat ?? null,
      data.snf ?? null
    ])
    return result[0]
  }
}
