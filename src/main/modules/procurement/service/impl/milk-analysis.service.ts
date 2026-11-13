import { injectable, inject } from 'tsyringe'
import { MilkSampleDto, MilkSampleUpdateDto } from '@shared/dtos/milk-collection/milk-sample.dto'
import { AppError, DatabaseError } from '../../../../utils/app-errors'
import { IMilkAnalysisService } from '../i-milk-analysis.service'
import { TOKENS } from '../../../../core/di/token'
import type { IMilkAnalysisRepo } from '../../repo/i-milk-analysis.repo'

@injectable()
export class MilkAnalysisService implements IMilkAnalysisService {
  constructor(
    @inject(TOKENS.MilkAnalysisRepo)
    private readonly milkAnaRepo: IMilkAnalysisRepo
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
