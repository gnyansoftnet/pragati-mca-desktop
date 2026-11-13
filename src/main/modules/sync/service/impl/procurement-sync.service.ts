import { inject, injectable } from 'tsyringe'
import { IProcurmentSyncService } from '../i-procurement-sync.service'
import { TOKENS } from '../../../../core/di/token'
import type { IProcurmentSyncRepo } from '../../repo/i-procurement-sync.repo'
import { AppError, DatabaseError } from '../../../../utils/app-errors'
import { MilkCollectionRow } from '../../../procurement/dto/milk-collection.rows'
import {
  MilkCollectionSyncRequestDto,
  MilkCollectionSyncResultDto
} from '../../dto/milk-save-api-response'
import { ApiService } from '../../../../utils/api-service'
import { Url } from '../../../../core/constants/url'

@injectable()
export class ProcurmentSyncService implements IProcurmentSyncService {
  constructor(
    @inject(TOKENS.ProSyncRepo)
    private readonly proSyncRepo: IProcurmentSyncRepo,
    private readonly api: ApiService
  ) {}

  async syncUpMilkCollection(
    data: MilkCollectionSyncRequestDto
  ): Promise<MilkCollectionSyncResultDto> {
    const response = await this.api.http.post<MilkCollectionSyncResultDto>(Url.milk, data)
    return response.data
  }

  async syncMilkCollection(fromDate: string, toDate: string): Promise<any> {
    try {
      const milkList: MilkCollectionRow[] = await this.proSyncRepo.getMilkCollectionsByDate(
        fromDate,
        toDate
      )
      const response: MilkCollectionSyncResultDto = await this.syncUpMilkCollection(milkList)
      const ids: number[] = milkList.map((row) => row.id)
      if (response.success == 1) {
        this.proSyncRepo.markSyncedWithRetry(ids)
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to save weight systems', { cause: error })
    }
  }
}
