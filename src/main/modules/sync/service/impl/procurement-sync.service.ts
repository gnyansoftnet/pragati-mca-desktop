import { inject, injectable } from 'tsyringe'
import { IProcurmentSyncService } from '../i-procurement-sync.service'
import { TOKENS } from '../../../../core/di/token'
import type { IProcurmentSyncRepo } from '../../repo/i-procurement-sync.repo'
import { AppError, DatabaseError } from '../../../../utils/app-errors'
import { MilkCollectionRow } from '../../../procurement/dto/milk-collection.rows'
import {
  MilkCollectionSyncRequestDto,
  MilkCollectionSyncResultDto,
  toMilkCollectionSave
} from '../../dto/milk-save-api-response'
import { ApiService } from '../../../../utils/api-service'
import { Url } from '../../../../core/constants/url'
import { MilkRejectionSyncRequestDto, toMilkRejectionSave } from '../../dto/milk-rejection-save'
import { MilkRejectionRow } from '../../../procurement/dto/milk-rejection.rows'

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
    const response = await this.api.http.post<MilkCollectionSyncResultDto>(Url.milkCollection, data)
    return response.data
  }
  async syncToWebMilkCollection(
    fromDate: string,
    toDate: string
  ): Promise<MilkCollectionSyncResultDto> {
    try {
      const milkList: MilkCollectionRow[] = await this.proSyncRepo.getMilkCollectionsByDate(
        fromDate,
        toDate
      )
      if (milkList.length === 0) {
        throw new DatabaseError('As for your date range their is no analyzed data')
      }

      const payload: MilkCollectionSyncRequestDto = milkList.map(toMilkCollectionSave)

      const response: MilkCollectionSyncResultDto = await this.syncUpMilkCollection(payload)

      if (response.success == 1) {
        const ids: number[] = milkList.map((row) => row.id)
        await this.proSyncRepo.markSyncedWithRetryMilkCollection(ids)
        await this.proSyncRepo.addMilkCollectionSyncLog(fromDate, toDate, 'success')
      } else {
        await this.proSyncRepo.addMilkCollectionSyncLog(fromDate, toDate, 'failed')
      }
      return response
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to sync milk collection', { cause: error })
    }
  }

  async syncUpMilkRejection(
    data: MilkRejectionSyncRequestDto
  ): Promise<MilkCollectionSyncResultDto> {
    const response = await this.api.http.post<MilkCollectionSyncResultDto>(Url.milkRejection, data)
    return response.data
  }

  async syncToWebMilkRejection(
    fromDate: string,
    toDate: string
  ): Promise<MilkCollectionSyncResultDto> {
    try {
      const milkList: MilkRejectionRow[] = await this.proSyncRepo.getMilkRejectionByDate(
        fromDate,
        toDate
      )
      if (milkList.length === 0) {
        throw new DatabaseError('As for your date range their is no analyzed data')
      }
      const payload: MilkRejectionSyncRequestDto = milkList.map(toMilkRejectionSave)
      const response: MilkCollectionSyncResultDto = await this.syncUpMilkRejection(payload)
      if (response.success == 1) {
        const ids: number[] = milkList.map((row) => row.id)
        await this.proSyncRepo.markSyncedWithRetryMilkCollection(ids)
        await this.proSyncRepo.addMilkRejectionSyncLog(fromDate, toDate, 'success')
      } else {
        await this.proSyncRepo.addMilkRejectionSyncLog(fromDate, toDate, 'failed')
      }
      return response
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to sync milk rejection', { cause: error })
    }
  }
}
