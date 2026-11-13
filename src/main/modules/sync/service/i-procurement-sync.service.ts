import {
  MilkCollectionSyncRequestDto,
  MilkCollectionSyncResultDto
} from '../dto/milk-save-api-response'

export interface IProcurmentSyncService {
  syncUpMilkCollection(data: MilkCollectionSyncRequestDto): Promise<MilkCollectionSyncResultDto>
  syncMilkCollection(fromDate: string, toDate: string): Promise<number>
}
