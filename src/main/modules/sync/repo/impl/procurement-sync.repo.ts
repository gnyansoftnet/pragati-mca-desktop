import { ResultSetHeader } from 'mysql2'
import { MilkCollectionRow } from '../../../procurement/dto/milk-collection.rows'
import { IProcurmentSyncRepo } from '../i-procurement-sync.repo'
import { db } from '../../../../core/config/database.config'
import { injectable } from 'tsyringe'
import { MilkRejectionRow } from '../../../procurement/dto/milk-rejection.rows'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
@injectable()
export class ProcurmentSyncRepo implements IProcurmentSyncRepo {
  constructor() {}

  async getMilkRejectionByDate(
    date: string,
    shift: string | number,
    syncStatus: 'pending' | 'synced'
  ): Promise<MilkRejectionRow[]> {
    if (!date || !DATE_RE.test(date)) {
      throw new Error('Valid date is required. Use format YYYY-MM-DD.')
    }
    if (shift === undefined || shift === null || String(shift).trim() === '') {
      throw new Error('Shift is required.')
    }
    if (!syncStatus || syncStatus.trim() === '') {
      throw new Error('Sync status is required.')
    }

    const sql = `
    SELECT *
    FROM rejection_milk
    WHERE sync_status = ?
      AND shift = ?
      AND d_flag = 0
      AND created_at >= ?
      AND created_at < DATE_ADD(?, INTERVAL 1 DAY)
    ORDER BY created_at ASC`
    const [rows] = await db.execute<MilkRejectionRow[]>(sql, [
      syncStatus.trim(),
      String(shift).trim(),
      date,
      date
    ])
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
        synced_at   = NOW()
    WHERE id IN (${placeholders})
      AND sync_status = 'pending'`
    const [result] = await db.execute<ResultSetHeader>(sql, ids)
    return result.affectedRows
  }

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

  // collection
  async getMilkCollectionsByDate(
    date: string,
    shift: number,
    syncStatus?: 'pending' | 'synced', // Optional: omit to get all statuses
    isAnalyse?: number // Optional: omit to get all (0 and 1)
  ): Promise<MilkCollectionRow[]> {
    // 1. Mandatory validations
    if (!date || !DATE_RE.test(date)) {
      throw new Error('Valid date is required. Use format YYYY-MM-DD.')
    }
    if (shift === undefined || shift === null || Number(shift) <= 0) {
      throw new Error('Valid shift is required.')
    }
    // 2. Base query & params
    let where = 'WHERE d_flag = 0 AND shift = ? AND sample_date = ?'
    const params: (string | number)[] = [shift, date]
    // 3. Dynamic sync_status filter
    if (syncStatus) {
      where += ' AND sync_status = ?'
      params.push(syncStatus)
    }
    // 4. Dynamic is_analyse filter (checks for null/undefined so 0 is recognized)
    if (isAnalyse !== undefined && isAnalyse !== null) {
      where += ' AND is_analyse = ?'
      params.push(Number(isAnalyse) === 1 ? 1 : 0)
    }
    // 5. Query execution
    const sql = `
    SELECT *
    FROM milk_collection_details
    ${where}
    ORDER BY id ASC`
    const [rows] = await db.execute<MilkCollectionRow[]>(sql, params)
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
