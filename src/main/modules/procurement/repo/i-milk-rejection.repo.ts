import { MilkRejectionSaveDto } from '@shared/dtos/milk-collection/milk-rejection.dto'
import { MilkRejectionRow, PagedMilkRejectionRows, } from '../dto/milk-rejection.rows'

export interface IMilkRejectionRepo {
 
  getPaginatedMilkRejections(
    search: string | undefined,
    limit: number,
    offset: number,
    fromDate?: string,
    toDate?: string
  ): Promise<PagedMilkRejectionRows>

  saveMilkRejection(data: MilkRejectionSaveDto): Promise<MilkRejectionRow | undefined>
}
