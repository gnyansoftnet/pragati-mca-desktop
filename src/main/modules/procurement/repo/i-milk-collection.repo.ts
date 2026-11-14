import { SaveMilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection.dto'
import { MilkCollectionPagedRows, MilkCollectionRow } from '../dto/milk-collection.rows'
import { WeightSystemRow } from '../dto/weight-system.row'

export interface IMilkCollectionRepo {
  saveWeightSystem(systemList: string, userCode: string): Promise<WeightSystemRow>
  getPaginatedMilkCollections(
    search: string | undefined,
    limit: number,
    offset: number,
    fromDate?: string,
    toDate?: string,
    isAnalyse?: number
  ): Promise<MilkCollectionPagedRows>
  getWeightSystems(): Promise<WeightSystemRow[]>
  getMilkCollections(): Promise<MilkCollectionRow[]>
  saveMilkCollection(data: SaveMilkCollectionDto): Promise<MilkCollectionRow>
}
