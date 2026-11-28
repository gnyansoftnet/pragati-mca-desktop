import { PeriodicReportRow } from '../dto/periodic-report.row'
import { RejectionReportPagedRows } from '../dto/rejection-report.row'
import { TruckSheetPagedRows } from '../dto/truck-sheet.row'

export interface IReportRepo {
  getPeriodicReport(fromDate: string, toDate: string): Promise<PeriodicReportRow[]>
  getTruckSheetReport(
    search: string | undefined,
    limit: number,
    offset: number,
    shift?: number,
    date?: string,
    isAnalyse?: number,
    routeCode?: string,
    vendorCode?: string
  ): Promise<TruckSheetPagedRows>
  getRejectionReport(
    search: string | undefined,
    limit: number,
    offset: number,
    shift?: number,
    date?: string,
    routeCode?: string,
    vendorCode?: string
  ): Promise<RejectionReportPagedRows>
}
