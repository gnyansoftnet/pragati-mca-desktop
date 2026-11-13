import { MilkCollectionRow } from '../../procurement/dto/milk-collection.rows'

export interface IProcurmentSyncRepo {
  getMilkCollectionsByDate(fromDate: string, toDate: string): Promise<MilkCollectionRow[]>
  markSynced(ids: number[])
  markSyncedWithRetry(ids: number[]): Promise<number>
  addSyncLog(fromDate: string, toDate: string, status: string): Promise<number>
}
