import {
  MilkRejectionResponseDto,
  MilkRejectionSaveDto,
  PaginatedMilkRejectionDto
} from '@shared/dtos/milk-collection/milk-rejection.dto'
import { PaginationRequestDto } from '@shared/dtos/pagination.dto'

export interface IMilkRejectionService {
  getPaginatedMilkRejections(
    data: PaginationRequestDto,
    fromDate?: string,
    toDate?: string
  ): Promise<PaginatedMilkRejectionDto>
  saveMilkRejection(data: MilkRejectionSaveDto): Promise<MilkRejectionResponseDto>
}
