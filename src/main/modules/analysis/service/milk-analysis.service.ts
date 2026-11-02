import { injectable, inject } from 'tsyringe'
import { MilkAnalysisRepo } from '../repo/milk-analysis.repo'
import { UpdateMilkCollectionDto } from '../dtos/milk-analysis-update.dto'

@injectable()
export class MilkAnalysisService {
  constructor(
    @inject(MilkAnalysisRepo)
    private readonly milkAnaRepo: MilkAnalysisRepo
  ) {}

  async updateMilkAnalysis(data: UpdateMilkCollectionDto): Promise<any> {
    return await this.milkAnaRepo.updateMilkAnalysis(data)
  }
}
