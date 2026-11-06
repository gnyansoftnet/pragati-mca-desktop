import { injectable, inject } from 'tsyringe'
import { MilkAnalysisRepo } from '../repo/milk-analysis.repo'
import { MilkSampleDto, MilkSampleUpdateDto } from '@shared/dtos/milk-collection/milk-sample.dto'
import { AppError, DatabaseError } from '../../../utils/app-errors'

@injectable()
export class MilkAnalysisService {
  constructor(
    @inject(MilkAnalysisRepo)
    private readonly milkAnaRepo: MilkAnalysisRepo
  ) {}

  async getMilkSamples(sampleDate: string, shift: number, plant: string): Promise<MilkSampleDto[]> {
    try {
      const rows = await this.milkAnaRepo.getMilkSamples(sampleDate, shift, plant.trim())
      return rows.map((p) => ({
        id: p.id,
        transCode: p.trans_code,
        plant: p.plant,
        shift: p.shift,
        sampleDate: p.sample_date,
        sampleCode: p.sample_code,
        netWeight: p.net_weight,
        fat: p.fat,
        snf: p.snf,
        isAnalyse: p.is_analyse
      }))
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch milk samples', { cause: error })
    }
  }

  async updateMilkSample(data: MilkSampleUpdateDto): Promise<any> {
    try {
      const rows = await this.milkAnaRepo.updateMilkSample(data)
      return rows.map((p) => ({
        id: p.id,
        transCode: p.trans_code,
        plant: p.plant,
        shift: p.shift,
        sampleDate: p.sample_date,
        sampleCode: p.sample_code,
        netWeight: p.net_weight,
        fat: p.fat,
        snf: p.snf,
        isAnalyse: p.is_analyse
      }))
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to update milk samples', { cause: error })
    }
  }
}
