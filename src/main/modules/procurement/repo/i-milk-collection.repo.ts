import { SaveMilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection.dto'
import { MilkCollectionPagedRows, MilkCollectionRow } from '../dto/milk-collection.rows'

export interface IMilkCollectionRepo {
  getPaginatedMilkCollections(
    search: string | undefined,
    limit: number,
    offset: number,
    shift?: number,
    date?: string,
    isAnalyse?: number
  ): Promise<MilkCollectionPagedRows>

  getMilkCollections(date: string, shift: number): Promise<MilkCollectionRow[]>
  saveMilkCollection(data: SaveMilkCollectionDto): Promise<MilkCollectionRow>
}
