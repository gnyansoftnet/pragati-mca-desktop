import {
  MilkRejectionResponseDto,
  MilkRejectionSaveDto,
  PaginatedMilkRejectionDto,
  ReasonDto
} from '@shared/dtos/milk-collection/milk-rejection.dto'
import { PaginationRequestDto } from '@shared/dtos/pagination.dto'

export interface IMilkRejectionService {
  getPaginatedMilkRejections(data: PaginationRequestDto): Promise<PaginatedMilkRejectionDto>
  saveMilkRejection(data: MilkRejectionSaveDto): Promise<MilkRejectionResponseDto>
  getReasons(): Promise<ReasonDto[]>
}
