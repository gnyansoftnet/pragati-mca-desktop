import {
  MilkCollectionDto,
  PaginatedMilkCollectionDto,
  SaveMilkCollectionDto
} from '@shared/dtos/milk-collection/milk-collection.dto'
import { PaginationRequestDto } from '@shared/dtos/pagination.dto'

export interface IMilkCollectionService {
  saveMilkCollection(data: SaveMilkCollectionDto): Promise<MilkCollectionDto>
  getPaginatedMilkCollections(
    data: PaginationRequestDto,
    fromDate?: string,
    toDate?: string,
    isAnalyse?: number
  ): Promise<PaginatedMilkCollectionDto>
  getMilkCollections(): Promise<MilkCollectionDto[]>
}
