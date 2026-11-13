import { MilkSampleUpdateDto } from '@shared/dtos/milk-collection/milk-sample.dto'
import { MilkSampleRow } from '../dto/milk-analysis.row'

export interface IMilkAnalysisRepo {
  getMilkSamples(sampleDate: string, shift: number, plant: string): Promise<MilkSampleRow[]>
  updateMilkSample(data: MilkSampleUpdateDto): Promise<MilkSampleRow>
}
