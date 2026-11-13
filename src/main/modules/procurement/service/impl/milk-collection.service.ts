import { injectable, inject } from 'tsyringe'
import { PaginationRequestDto } from '../../../../../shared/dtos/pagination.dto'
import {
  MilkCollectionDto,
  PaginatedMilkCollectionDto,
  SaveMilkCollectionDto
} from '../../../../../shared/dtos/milk-collection/milk-collection.dto'
import { WeightSystemDto } from '../../../../../shared/dtos/milk-collection/weight-system.dto'
import { AppError, DatabaseError } from '../../../../utils/app-errors'
import { IMilkCollectionService } from '../i-milk-collection.service'
import { TOKENS } from '../../../../core/di/token'
import type { IMilkCollectionRepo } from '../../repo/i-milk-collection.repo'

@injectable()
export class MilkCollectionService implements IMilkCollectionService {
  constructor(
    @inject(TOKENS.MilkCollectionRepo)
    private readonly milkRepo: IMilkCollectionRepo
  ) {}

  async saveMilkCollection(data: SaveMilkCollectionDto): Promise<MilkCollectionDto> {
    try {
      const rows = await this.milkRepo.saveMilkCollection(data)
      return rows.map((p) => ({
        id: p.id,
        transCode: p.trans_code,
        plant: p.plant,
        userCode: p.user_code,
        rootCode: p.root_code,
        vendorCode: p.vendor_code,
        shift: p.shift,
        sampleDate: p.sample_date,
        sampleCode: p.sample_code,
        canType: p.can_type,
        weightSystem: p.weight_system,
        milkType: p.milk_type,
        milkStatus: p.milk_status,
        tipingTime: p.tiping_time,
        noOfCans: p.no_of_cans,
        grossWeight: p.gross_weight,
        netWeight: p.net_weight,
        netLtr: p.net_ltr,
        fat: p.fat,
        snf: p.snf,
        clr: p.clr,
        isAnalyse: p.is_analyse,
        entry: p.entry,
        syncStatus: p.sync_status,
        syncDate: p.sync_date,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        dFlag: p.d_flag
      }))
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to update Save milk', { cause: error })
    }
  }

  async getPaginatedMilkCollections(
    data: PaginationRequestDto,
    fromDate?: string,
    toDate?: string
  ): Promise<PaginatedMilkCollectionDto> {
    const page = Math.max(1, Math.trunc(Number(data.page)) || 1)
    const limit = Math.max(1, Math.trunc(Number(data.limit)) || 10)
    const offset = (page - 1) * limit
    const search = data.search?.trim() || undefined

    try {
      const { rows, total } = await this.milkRepo.getPaginatedMilkCollections(
        search,
        limit,
        offset,
        fromDate,
        toDate
      )
      const totalPages = Math.ceil(total / limit)
      return {
        data: rows.map((r) => ({
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
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch milk collections', { cause: error })
    }
  }

  async getMilkCollections(): Promise<MilkCollectionDto[]> {
    try {
      const rows = await this.milkRepo.getMilkCollections()
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
      throw new DatabaseError('Failed to fetch weight systems', { cause: error })
    }
  }

  async getWeightSystems(): Promise<WeightSystemDto[]> {
    try {
      const rows = await this.milkRepo.getWeightSystems()
      return rows.map((r) => ({
        id: r.id,
        system_list: r.system_list
      }))
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch weight systems', { cause: error })
    }
  }

  async saveWeightSystem(systemList: string, userCode: string): Promise<WeightSystemDto> {
    try {
      const rows = await this.milkRepo.saveWeightSystem(systemList, userCode)
      return {
        id: rows.id,
        system_list: rows.system_list
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to save weight systems', { cause: error })
    }
  }
}
