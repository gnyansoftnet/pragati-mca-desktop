export interface MilkSampleDto {
  id: number
  transCode: string
  plant: string
  shift: number
  sampleDate: string
  sampleCode: number
  netWeight: number
  fat: number
  snf: number
  isAnalyse: number
}

export interface MilkSampleUpdateDto {
  sampleDate: string
  shift: number
  plant: string
  sampleCode: string
  fat: number
  snf: number
}
