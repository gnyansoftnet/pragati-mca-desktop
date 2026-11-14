import { MilkRejectionRow } from '../../procurement/dto/milk-rejection.rows'

export interface MilkRejectionSaveDto {
  rejection_code: string
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

export const toMilkRejectionSave = (row: MilkRejectionRow): MilkRejectionSaveDto => ({
  rejection_code: row.rejection_code,
  plant: row.plant,
  dsk_name: row.dsk_name,
  dsk_code: row.dsk_code,
  route: row.route,
  supervisor: row.supervisor,
  shift: row.shift,
  no_of_canes: row.no_of_canes,
  aprox_quantity: row.aprox_quantity,
  reason: row.reason
})
