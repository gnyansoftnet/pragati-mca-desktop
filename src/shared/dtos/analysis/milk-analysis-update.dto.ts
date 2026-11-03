export interface MilkSampleUpdateDto {
  sampleNo: string | number
  port?: string
  netweight?: number
  fat?: number
  snf?: number
}

export interface UpdateMilkCollectionDto {
  date: string // YYYY-MM-DD
  shift: number
  plant: string
  samples: MilkSampleUpdateDto[]
}
