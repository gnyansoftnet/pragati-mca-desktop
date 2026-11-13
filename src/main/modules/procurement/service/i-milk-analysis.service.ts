import { MilkSampleDto, MilkSampleUpdateDto } from '@shared/dtos/milk-collection/milk-sample.dto'

export interface IMilkAnalysisService {
  getMilkSamples(sampleDate: string, shift: number, plant: string): Promise<MilkSampleDto[]>
  updateMilkSample(data: MilkSampleUpdateDto): Promise<any>
}
