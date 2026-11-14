import { MilkCollectionRow } from '../../procurement/dto/milk-collection.rows'
import { MilkRejectionRow } from '../../procurement/dto/milk-rejection.rows'

export interface IProcurmentSyncRepo {
  getMilkCollectionsByDate(fromDate: string, toDate: string): Promise<MilkCollectionRow[]>
  markSyncedWithRetryMilkCollection(ids: number[]): Promise<number>
  addMilkCollectionSyncLog(fromDate: string, toDate: string, status: string): Promise<number>

  getMilkRejectionByDate(fromDate: string, toDate: string): Promise<MilkRejectionRow[]>
  markSyncedWithRetryMilkRejection(ids: number[]): Promise<number>
  addMilkRejectionSyncLog(fromDate: string, toDate: string, status: string): Promise<number>
}
