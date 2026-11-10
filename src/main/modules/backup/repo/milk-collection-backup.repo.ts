import { injectable } from 'tsyringe'
import { db } from '../../../core/config/database.config'
import { ResultSetHeader } from 'mysql2'
import { MilkCollectionRow } from '../../milk_collection/repositories/milk-collection.rows'

@injectable()
export class MilkCollectionBackupRepo {
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

  async markSynced(ids: number[]) {
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

  async markSyncedWithRetry(ids: number[], tries = 3): Promise<number> {
    for (let i = 1; i <= tries; i++) {
      try {
        return await this.markSynced(ids)
      } catch (err) {
        if (i === tries) throw err
        await new Promise((r) => setTimeout(r, 500 * i))
      }
    }
    return 0
  }

  async addSyncLog(fromDate: string, toDate: string, status: string): Promise<number> {
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
