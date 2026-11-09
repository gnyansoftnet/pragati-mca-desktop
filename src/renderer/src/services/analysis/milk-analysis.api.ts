import { MilkSampleDto, MilkSampleUpdateDto } from "@shared/dtos/milk-collection/milk-sample.dto"

const analysisApi = {
  getMilkSamples: (date: string, shift: number, plant: string): Promise<MilkSampleDto[]> => {
    return window.api.getMilkSamples(date, shift, plant)
  },

  updateMilkSample: (payload: MilkSampleUpdateDto): Promise<any> => {
    return window.api.updateMilkSample(payload)
  }
}

export default analysisApi