import { PaginationRequestDto } from '@shared/dtos/pagination.dto'
import { PeriodicReportDto } from '@shared/dtos/reports/periodic-report.dto'
import { PaginatedRejectionMilkReportDto } from '@shared/dtos/reports/rejection-milk-report.dto'
import { PaginatedTruckSheetDto } from '@shared/dtos/reports/truck-sheet.dto'

export interface IReportService {
  getPeriodicReport(fromDate: string, toDate: string): Promise<PeriodicReportDto[]>
  getTruckSheetReport(
    data: PaginationRequestDto,
    shift?: number,
    date?: string,
    isAnalyse?: number,
    routeCode?: string,
    vendorCode?: string
  ): Promise<PaginatedTruckSheetDto>

  getRejectionReport(
    data: PaginationRequestDto,
    shift?: number,
    date?: string,
    routeCode?: string,
    vendorCode?: string
  ): Promise<PaginatedRejectionMilkReportDto>
}
