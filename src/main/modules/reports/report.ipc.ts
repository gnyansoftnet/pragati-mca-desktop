import { ipcMain } from 'electron'
import { TOKENS } from '../../core/di/token'
import { container } from 'tsyringe'
import { IReportService } from './service/i-report.service'
import { PaginatedTruckSheetDto } from '@shared/dtos/reports/truck-sheet.dto'
import { PaginationRequestDto } from '@shared/dtos/pagination.dto'
import { PeriodicReportDto } from '@shared/dtos/reports/periodic-report.dto'
import { PaginatedRejectionMilkReportDto } from '@shared/dtos/reports/rejection-milk-report.dto'

export function registerReportIpc(): void {
  const reportService = container.resolve<IReportService>(TOKENS.ReportService)

  ipcMain.handle(
    'report:getTruckSheetReport',
    (
      _event,
      params: PaginationRequestDto,
      shift?: number,
      date?: string,
      isAnalyse?: number,
      routeCode?: string,
      vendorCode?: string
    ): Promise<PaginatedTruckSheetDto> =>
      reportService.getTruckSheetReport(params, shift, date, isAnalyse, routeCode, vendorCode)
  )
  ipcMain.handle(
    'report:getRejectionReport',
    (
      _event,
      params: PaginationRequestDto,
      shift?: number,
      date?: string,
      routeCode?: string,
      vendorCode?: string
    ): Promise<PaginatedRejectionMilkReportDto> =>
      reportService.getRejectionReport(params, shift, date, routeCode, vendorCode)
  )
  ipcMain.handle(
    'report:getPeriodicReport',
    (_event, fromDate: string, toDate: string): Promise<PeriodicReportDto[]> =>
      reportService.getPeriodicReport(fromDate, toDate)
  )
}
