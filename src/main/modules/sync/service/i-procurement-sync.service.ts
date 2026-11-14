import { MilkRejectionSyncRequestDto } from '../dto/milk-rejection-save'
import {
  MilkCollectionSyncRequestDto,
  MilkCollectionSyncResultDto
} from '../dto/milk-save-api-response'

export interface IProcurmentSyncService {
  syncUpMilkCollection(data: MilkCollectionSyncRequestDto): Promise<MilkCollectionSyncResultDto>
  syncUpMilkRejection(data: MilkRejectionSyncRequestDto): Promise<MilkCollectionSyncResultDto>
  markStatusMilkCollection(fromDate: string, toDate: string): Promise<number>
}
