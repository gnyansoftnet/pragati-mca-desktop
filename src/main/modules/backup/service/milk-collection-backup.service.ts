import { inject, injectable } from 'tsyringe'
import { MilkCollectionBackupRepo } from '../repo/milk-collection-backup.repo'
import { MilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection.dto'
import { AppError, DatabaseError } from '../../../utils/app-errors'

@injectable()
export class MilkCollectionBackupService {
  constructor(
    @inject(MilkCollectionBackupRepo)
    private readonly milkBackupRepo: MilkCollectionBackupRepo
  ) {}

  async getMilkCollectionsByDate(fromDate: string, toDate: string): Promise<MilkCollectionDto[]> {
    try {
      const rows = await this.milkBackupRepo.getMilkCollectionsByDate(fromDate, toDate)
      return rows.map((r) => ({
        id: r.id,
        transCode: r.trans_code,
        plant: r.plant,
        userCode: r.user_code,
        rootCode: r.root_code,
        vendorCode: r.vendor_code,
        shift: r.shift,
        sampleDate: r.sample_date,
        sampleCode: r.sample_code,
        canType: r.can_type,
        weightSystem: r.weight_system,
        milkType: r.milk_type,
        milkStatus: r.milk_status,
        tipingTime: r.tiping_time,
        noOfCans: r.no_of_cans,
        grossWeight: r.gross_weight,
        netWeight: r.net_weight,
        netLtr: r.net_ltr,
        fat: r.fat,
        snf: r.snf,
        clr: r.clr,
        isAnalyse: r.is_analyse,
        entry: r.entry,
        syncStatus: r.sync_status,
        syncDate: r.sync_date,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        dFlag: r.d_flag
      }))
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch milke collection', { cause: error })
    }
  }
  async markSyncedWithRetry(ids: number[]): Promise<number> {
    try {
      return await this.milkBackupRepo.markSyncedWithRetry(ids)
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to mark milk collections as synced', { cause: error })
    }
  }

  async addSyncLog(fromDate: string, toDate: string, status: 'synced' | 'failed'): Promise<number> {
    try {
      return await this.milkBackupRepo.addSyncLog(fromDate, toDate, status)
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to add sync log', { cause: error })
    }
  }
}
