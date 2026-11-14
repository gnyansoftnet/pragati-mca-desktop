import { ResultSetHeader } from 'mysql2'
import { MilkCollectionRow } from '../../../procurement/dto/milk-collection.rows'
import { IProcurmentSyncRepo } from '../i-procurement-sync.repo'
import { db } from '../../../../core/config/database.config'
import { injectable } from 'tsyringe'
import { MilkRejectionRow } from '../../../procurement/dto/milk-rejection.rows'
@injectable()
export class ProcurmentSyncRepo implements IProcurmentSyncRepo {
  constructor() {}

  async addMilkRejectionSyncLog(fromDate: string, toDate: string, status: string): Promise<number> {
    const sql = `
    INSERT INTO milk_rejection_sync_log (lastSycfrom, lastSyncTO, status)
    VALUES (?, ?, ?)`
    const [result] = await db.execute<ResultSetHeader>(sql, [
      `${fromDate} 00:00:00`,
      `${toDate} 23:59:59`,
      status
    ])
    return result.insertId
  }
  async getMilkRejectionByDate(fromDate: string, toDate: string): Promise<MilkRejectionRow[]> {
    const sql = `
    SELECT *
    FROM rejection_milk
    WHERE sync_status = 'pending'
      AND d_flag = 0
      AND created_at >= ?
      AND created_at <  DATE_ADD(?, INTERVAL 1 DAY)
    ORDER BY created_at ASC`
    const [rows] = await db.execute<MilkRejectionRow[]>(sql, [fromDate, toDate])
    return rows
  }

  async markSyncedWithRetryMilkRejection(ids: number[], tries = 3): Promise<number> {
    for (let i = 1; i <= tries; i++) {
      try {
        return await this.markRejectionSynced(ids)
      } catch (err) {
        if (i === tries) throw err
        await new Promise((r) => setTimeout(r, 500 * i))
      }
    }
    return 0
  }

  async markRejectionSynced(ids: number[]) {
    if (!Array.isArray(ids) || ids.length === 0) return 0
    const placeholders = ids.map(() => '?').join(',')
    const sql = `
    UPDATE rejection_milk
    SET sync_status = 'synced',
        sync_date   = NOW()
    WHERE id IN (${placeholders})
      AND sync_status = 'pending'`
    const [result] = await db.execute<ResultSetHeader>(sql, ids)
    return result.affectedRows
  }


  // collection

  async getMilkCollectionsByDate(fromDate: string, toDate: string): Promise<MilkCollectionRow[]> {
    const sql = `
    SELECT *
    FROM milk_collection_details
    WHERE sync_status = 'pending'
      AND is_analyse = 1
      AND d_flag = 0
      AND created_at >= ?
      AND created_at <  DATE_ADD(?, INTERVAL 1 DAY)
    ORDER BY created_at ASC`
    const [rows] = await db.execute<MilkCollectionRow[]>(sql, [fromDate, toDate])
    return rows
  }

  async markCollectionSynced(ids: number[]) {
    if (!Array.isArray(ids) || ids.length === 0) return 0
    const placeholders = ids.map(() => '?').join(',')
    const sql = `
    UPDATE milk_collection_details
    SET sync_status = 'synced',
        sync_date   = NOW()
    WHERE id IN (${placeholders})
      AND sync_status = 'pending'`
    const [result] = await db.execute<ResultSetHeader>(sql, ids)
    return result.affectedRows
  }

  async markSyncedWithRetryMilkCollection(ids: number[], tries = 3): Promise<number> {
    for (let i = 1; i <= tries; i++) {
      try {
        return await this.markCollectionSynced(ids)
      } catch (err) {
        if (i === tries) throw err
        await new Promise((r) => setTimeout(r, 500 * i))
      }
    }
    return 0
  }

  async addMilkCollectionSyncLog(
    fromDate: string,
    toDate: string,
    status: string
  ): Promise<number> {
    const sql = `
    INSERT INTO milk_collection_sync_log (lastSycfrom, lastSyncTO, status)
    VALUES (?, ?, ?)`
    const [result] = await db.execute<ResultSetHeader>(sql, [
      `${fromDate} 00:00:00`,
      `${toDate} 23:59:59`,
      status
    ])
    return result.insertId
  }
}
