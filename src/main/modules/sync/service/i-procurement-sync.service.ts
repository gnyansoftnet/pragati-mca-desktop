import { MilkRejectionSyncRequestDto } from '../dto/milk-rejection-save'
import {
  MilkCollectionSyncRequestDto,
  MilkCollectionSyncResultDto
} from '../dto/milk-save-api-response'

export interface IProcurmentSyncService {
  syncUpMilkCollection(data: MilkCollectionSyncRequestDto): Promise<MilkCollectionSyncResultDto>
  syncUpMilkRejection(data: MilkRejectionSyncRequestDto): Promise<MilkCollectionSyncResultDto>
  syncToWebMilkCollection(date: string, shift: number): Promise<MilkCollectionSyncResultDto>
  syncToWebMilkRejection(date: string, shift: number): Promise<MilkCollectionSyncResultDto>
}
