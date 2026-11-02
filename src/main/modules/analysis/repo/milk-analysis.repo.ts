import { injectable } from 'tsyringe'
import { db } from '../../../core/config/database.config'
import { UpdateMilkCollectionDto } from '../dtos/milk-analysis-update.dto'
import { RowDataPacket } from 'mysql2'

export interface UpdateAnalysisResultDto {
  total: number
  updated: number
  notFound: (string | number)[]
}

interface UpdateAnalysisRow extends RowDataPacket {
  success: number
  message: string
  data: UpdateAnalysisResultDto | string | null
}

@injectable()
export class MilkAnalysisRepo {
  async updateMilkAnalysis(data: UpdateMilkCollectionDto): Promise<UpdateAnalysisResultDto> {
    const [result] = await db.query<UpdateAnalysisRow[][]>(
      'CALL USP_M_MILK_COLLECTION_UPDATE_ANALYSIS(?,?,?,?)',
      [data.date, data.shift, data.plant, JSON.stringify(data.samples)]
    )
    const row = result[0]?.[0]
    if (!row) {
      throw new Error('No response from procedure')
    }
    if (row.success === 0) {
      throw new Error(String(row.message))
    }
    const payload = typeof row.data === 'string' ? JSON.parse(row.data) : row.data

    return {
      total: payload?.total ?? 0,
      updated: payload?.updated ?? 0,
      notFound: payload?.notFound ?? []
    }
  }
}
