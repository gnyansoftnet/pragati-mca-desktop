import { MilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection.dto'

const collectionApi = {
  getMilkCollections: (date?: string, shift?: number): Promise<MilkCollectionDto[]> => {
    return window.api.getMilkCollections(date as string, shift as number)
  }
}

export default collectionApi