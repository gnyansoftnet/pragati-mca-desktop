import {
  MilkCollectionDto,
  PaginatedMilkCollectionDto,
  SaveMilkCollectionDto
} from '@shared/dtos/milk-collection/milk-collection.dto'
import { WeightSystemDto } from '@shared/dtos/milk-collection/weight-system.dto'
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
  getWeightSystems(): Promise<WeightSystemDto[]>
  saveWeightSystem(systemList: string, userCode: string): Promise<WeightSystemDto>
}
