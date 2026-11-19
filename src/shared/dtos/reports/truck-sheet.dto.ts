import { PaginatedResponseDto } from '../pagination.dto'

export interface TruckSheetDto {
  id: number
  transCode: string
  plant: string
  userCode: string
  rootCode: string
  rootName?: string | null
  vendorCode: string
  dskName?: string | null
  shift: number
  shiftName?: string | null
  sampleDate: string
  sampleCode: number
  canType: string
  weightSystem: string
  milkType: string
  milkTypeName?: string | null
  milkStatus: string
  milkStatusName?: string | null
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

export type PaginatedTruckSheetDto = PaginatedResponseDto<TruckSheetDto>
