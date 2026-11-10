import { MilkCollectionDto } from "@shared/dtos/milk-collection/milk-collection.dto"

const collectionApi = {
  getMilkCollections: (): Promise<MilkCollectionDto[]> => {
    return window.api.getMilkCollections()
  }
}

export default collectionApi