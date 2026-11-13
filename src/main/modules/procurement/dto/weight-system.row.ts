import { RowDataPacket } from 'mysql2'

export interface WeightSystemRow extends RowDataPacket {
  id: number
  system_list: string
}
