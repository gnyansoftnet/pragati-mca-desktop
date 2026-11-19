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
    shift?: number,
    date?: string,
    isAnalyse?: number
  ): Promise<PaginatedMilkCollectionDto>
  getMilkCollections(date: string, shift: number): Promise<MilkCollectionDto[]>
}
