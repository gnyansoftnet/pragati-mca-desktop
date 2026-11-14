export interface MilkRejectionSaveDto {
  rejection_code: number
  plant: string
  dsk_name: string
  dsk_code: string
  route: string
  supervisor: string
  shift: string
  no_of_canes: string
  aprox_quantity: string
  reason: string
}
export type MilkRejectionSyncRequestDto = MilkRejectionSaveDto[]
