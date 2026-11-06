import { PaginatedResponseDto } from '../pagination.dto'

export interface MilkCollectionDto {
  id: number
  transCode: string
  plant: string
  userCode: string
  rootCode: string
  vendorCode: string
  shift: number
  sampleDate: string
  sampleCode: number
  canType: string
  weightSystem: string
  milkType: string
  milkStatus: string
  tipingTime: string
  noOfCans: number
  grossWeight: number
  netWeight: number
  netLtr: number
  fat: number
  snf: number
  clr: number
  isAnalyse: number
  entry: string
  syncStatus: string
  syncDate: string
  createdAt: string
  updatedAt: string
  dFlag: number
}

export type PaginatedMilkCollectionDto = PaginatedResponseDto<MilkCollectionDto>

export interface SaveMilkCollectionDto {
  plant: string
  shift: number
  tipingTime: string
  entry: string
  userCode: string
  rootCode: string
  vendorCode: string
  canType?: string
  weightSystem?: string
  milkType?: string
  milkStatus?: string
  noOfCans?: number
  grossWeight?: number
  netWeight?: number
  netLtr?: number
  fat?: number
  snf?: number
  clr?: number
}
