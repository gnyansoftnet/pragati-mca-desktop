import { PaginatedTruckSheetDto } from '@shared/dtos/reports/truck-sheet.dto'
import { IReportService } from '../i-report.service'
import { AppError, DatabaseError } from '../../../../utils/app-errors'
import { PaginationRequestDto } from '@shared/dtos/pagination.dto'
import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../../../core/di/token'
import type { IReportRepo } from '../../repo/i-report.repo'
import { PeriodicReportDto } from '@shared/dtos/reports/periodic-report.dto'
import { PaginatedRejectionMilkReportDto } from '@shared/dtos/reports/rejection-milk-report.dto'

@injectable()
export class ReportService implements IReportService {
  constructor(
    @inject(TOKENS.ReportRepo)
    private readonly reportRepo: IReportRepo
  ) {}

  async getRejectionReport(
    data: PaginationRequestDto,
    shift?: number,
    date?: string,
    routeCode?: string,
    vendorCode?: string
  ): Promise<PaginatedRejectionMilkReportDto> {
    const page = Math.max(1, Math.trunc(Number(data.page)) || 1)
    const limit = Math.max(1, Math.trunc(Number(data.limit)) || 10)
    const offset = (page - 1) * limit
    const search = data.search?.trim() || undefined

    try {
      const { rows, total } = await this.reportRepo.getRejectionReport(
        search,
        limit,
        offset,
        shift,
        date,
        routeCode,
        vendorCode
      )
      const totalPages = Math.ceil(total / limit)
      return {
        data: rows.map((r) => ({
          id: r.id,
          aproxQuantity: r.aprox_quantity,
          dskCode: r.dsk_code,
          dskName: r.dsk_name,
          noOfCanes: r.no_of_canes,
          plant: r.plant,
          reason: r.reason,
          rejectionCode: r.rejection_code,
          route: r.route,
          shift: r.shift,
          supervisor: r.supervisor,
          routeName: r.route_name,
          shiftName: r.shift_name,
          supervisorName: r.supervisor_name,

          syncStatus: r.sync_status,
          syncAt: r.sync_at,
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
      throw new DatabaseError('Failed ', { cause: error })
    }
  }

  async getPeriodicReport(fromDate: string, toDate: string): Promise<PeriodicReportDto[]> {
    try {
      const rows = await this.reportRepo.getPeriodicReport(fromDate, toDate)
      return rows.map((r) => ({
        route_code: String(r.route_code),
        route_name: String(r.route_name ?? r.route_code),
        morning: {
          Total_KG: Number(Number(r.morning_total_kg ?? 0).toFixed(2)),
          fatavg: Number(Number(r.morning_fat_avg ?? 0).toFixed(2)),
          snfAvg: Number(Number(r.morning_snf_avg ?? 0).toFixed(2))
        },
        evening: {
          Total_KG: Number(Number(r.evening_total_kg ?? 0).toFixed(2)),
          fatavg: Number(Number(r.evening_fat_avg ?? 0).toFixed(2)),
          snfAvg: Number(Number(r.evening_snf_avg ?? 0).toFixed(2))
        }
      }))
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch periodic report', { cause: error })
    }
  }
  async getTruckSheetReport(
    data: PaginationRequestDto,
    shift?: number,
    date?: string,
    isAnalyse?: number,
    routeCode?: string,
    vendorCode?: string
  ): Promise<PaginatedTruckSheetDto> {
    const page = Math.max(1, Math.trunc(Number(data.page)) || 1)
    const limit = Math.max(1, Math.trunc(Number(data.limit)) || 10)
    const offset = (page - 1) * limit
    const search = data.search?.trim() || undefined

    try {
      const { rows, total } = await this.reportRepo.getTruckSheetReport(
        search,
        limit,
        offset,
        shift,
        date,
        isAnalyse,
        routeCode,
        vendorCode
      )
      const totalPages = Math.ceil(total / limit)
      return {
        data: rows.map((r) => ({
          id: r.id,
          transCode: r.trans_code,
          plant: r.plant,
          userCode: r.user_code,
          dskName: r.dsk_name,
          rootName: r.route_name,
          rootCode: r.root_code,
          vendorCode: r.vendor_code,
          shift: r.shift,
          shiftName: r.shift_name,
          sampleDate: r.sample_date,
          sampleCode: r.sample_code,
          canType: r.can_type,
          weightSystem: r.weight_system,
          milkType: r.milk_type,
          milkTypeName: r.milk_type_name,
          milkStatus: r.milk_status,
          milkStatusName: r.milk_status_name,
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
      throw new DatabaseError('Failed ', { cause: error })
    }
  }
}
