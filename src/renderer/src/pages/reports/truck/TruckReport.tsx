import React, { useState, useEffect, useMemo } from 'react'
import {
  FileSpreadsheet,
  FileDown,
  Search,
  RefreshCw
} from 'lucide-react'
import { toast } from 'react-toastify'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import CustomForm from '@renderer/components/customform/CustomForm'
import Button1 from '@renderer/components/buttons/Button1'
import TablePagination from '@renderer/components/table/TablePagination'
import TableToolbar from '@renderer/components/table/TableToolbar'
import { useAuth } from '@renderer/context/AuthContext'
import { useShift } from '@renderer/hooks/useShift'
import { MilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection.dto'

export const TruckReport: React.FC = () => {
  const { user } = useAuth()
  const { shiftOptions, currentShiftId, loadingShifts } = useShift(user?.plant)

  // Current Date in YYYY-MM-DD
  const getCurrentDateISO = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Convert Date to DD-MM-YYYY (e.g. 24-09-2026)
  const formatDateDDMMYYYY = (dateVal?: string | Date): string => {
    if (!dateVal) return ''
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return String(dateVal)
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Filter input states
  const [date, setDate] = useState<string>(getCurrentDateISO())
  const [shift, setShift] = useState<string>(currentShiftId || '1')

  // Applied filter states
  const [appliedDate, setAppliedDate] = useState<string>(getCurrentDateISO())
  const [appliedShift, setAppliedShift] = useState<string>(currentShiftId || '1')

  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [pageSize, setPageSize] = useState<number | 'all'>(10)
  const [reportData, setReportData] = useState<MilkCollectionDto[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Automatically update shift once detected
  useEffect(() => {
    if (currentShiftId) {
      setShift((prev) => prev || currentShiftId)
      setAppliedShift((prev) => prev || currentShiftId)
    }
  }, [currentShiftId])

  // Fetch Report from API (Exact unchanged backend call)
  const fetchTruckReport = async (
    pageNo = pagination.page,
    limitVal = pageSize,
    searchVal = searchQuery,
    selectedDate = appliedDate,
    selectedShift = appliedShift
  ): Promise<void> => {
    try {
      setLoading(true)
      const actualLimit = limitVal === 'all' ? 1000000 : limitVal
      const shiftNum =
        selectedShift && selectedShift !== 'all' && Number(selectedShift) > 0
          ? Number(selectedShift)
          : undefined

      if (typeof window !== 'undefined' && (window.api as any)?.getTruckSheetReport) {
        const response = await (window.api as any).getTruckSheetReport(
          {
            page: pageNo,
            limit: actualLimit,
            search: searchVal.trim()
          },
          shiftNum,
          selectedDate,
          0 // Pending / standard tipping collection records
        )

        if (response) {
          const list: MilkCollectionDto[] = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response)
              ? response
              : []
          setReportData(list)

          if (response.pagination) {
            setPagination(response.pagination)
          }
        }
      } else {
        toast.error('getTruckSheetReport API is not available on window.api')
      }
    } catch (error: any) {
      console.error('Failed to load truck sheet report:', error)
      toast.error(error?.message || 'Failed to load truck sheet report.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Search submit
  const handleSubmitFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setAppliedDate(date)
    setAppliedShift(shift)
    fetchTruckReport(1, pageSize, searchQuery, date, shift)
  }

  // Auto-fetch on search or page size change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTruckReport(1, pageSize, searchQuery, appliedDate, appliedShift)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, pageSize])

  // Initial load
  useEffect(() => {
    fetchTruckReport(1, pageSize, searchQuery, getCurrentDateISO(), currentShiftId || '1')
  }, [])

  // Calculate Column Totals & Weighted Averages
  const totals = useMemo(() => {
    let totalGross = 0
    let totalCans = 0
    let totalNet = 0
    let productFat = 0
    let productSnf = 0

    reportData.forEach((row) => {
      const gross = Number(row.grossWeight) || 0
      const net = Number(row.netWeight) || 0
      const cans = Number(row.noOfCans) || 0
      const fat = Number(row.fat) || 0
      const snf = Number(row.snf) || 0

      totalGross += gross
      totalCans += cans
      totalNet += net
      productFat += net * fat
      productSnf += net * snf
    })

    const avgFat = totalNet > 0 ? productFat / totalNet : 0
    const avgSnf = totalNet > 0 ? productSnf / totalNet : 0

    return {
      totalGross: totalGross.toFixed(1),
      totalCans,
      totalNet: totalNet.toFixed(1),
      avgFat: avgFat.toFixed(1),
      avgSnf: avgSnf.toFixed(1)
    }
  }, [reportData])

  // Download Excel (.xls) file: ONLY exports the table element
  const handleDownloadExcel = () => {
    if (reportData.length === 0) {
      toast.warn('No records available to export.')
      return
    }

    const tableElement = document.getElementById('truck-sheet-table')
    if (!tableElement) return

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 10px; font-family: Arial, sans-serif; font-size: 11px; }
          th { background-color: #f1f5f9; font-weight: bold; text-align: left; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
        </style>
      </head>
      <body>
        ${tableElement.outerHTML}
      </body>
      </html>
    `

    const blob = new Blob(['\ufeff', excelTemplate], {
      type: 'application/vnd.ms-excel;charset=utf-8;'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Truck_Sheet_${appliedDate}_Shift_${appliedShift}.xls`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Excel report downloaded successfully!')
  }

  // Download PDF Handler - Uses jsPDF + autoTable to prompt local "Save As" file path with top letterhead
  const handleDownloadPdf = () => {
    if (reportData.length === 0) {
      toast.warn('No records available to download as PDF.')
      return
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const plantId = user?.plant || '1207'
    const plantName = user?.plantName || 'ARILO'

    // 1. Draw Top Letterhead (Matching the reference photo)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('PRAGATI MILK PRODUCTS PRIVATE LIMITED', 105, 11, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`CHILLING CENTER - ${plantId},${plantName}`, 105, 16, { align: 'center' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('TRUCK SHEET', 105, 21, { align: 'center' })

    const shiftLabel =
      appliedShift === '1'
        ? 'Morning'
        : appliedShift === '2'
          ? 'Evening'
          : `Shift ${appliedShift}`

    const dateHeaderStr = `Date: ${formatDateDDMMYYYY(appliedDate)}    |    Shift: ${shiftLabel}`

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.text(dateHeaderStr, 105, 25.5, { align: 'center' })

    // 2. Define Header Columns with strict typing (as const)
    const head = [
      [
        { content: 'Sample No.', styles: { halign: 'center' as const } },
        { content: 'Date', styles: { halign: 'center' as const } },
        { content: 'Shift', styles: { halign: 'center' as const } },
        { content: 'DSK Name', styles: { halign: 'left' as const } },
        { content: 'DSK Code', styles: { halign: 'center' as const } },
        { content: 'Route Name', styles: { halign: 'left' as const } },
        { content: 'Gross Weight', styles: { halign: 'right' as const } },
        { content: 'No Of Cans', styles: { halign: 'center' as const } },
        { content: 'FAT %', styles: { halign: 'right' as const } },
        { content: 'SNF %', styles: { halign: 'right' as const } },
        { content: 'Net Weight', styles: { halign: 'right' as const } }
      ]
    ]

    // 3. Define Body Rows
    const body = reportData.map((item) => {
      const shiftLetter = item.shiftName
        ? item.shiftName.toLowerCase().startsWith('m')
          ? 'M'
          : item.shiftName.toLowerCase().startsWith('e')
            ? 'E'
            : item.shiftName
        : Number(item.shift) === 1
          ? 'M'
          : 'E'

      return [
        String(item.sampleCode ?? ''),
        formatDateDDMMYYYY(item.sampleDate || item.createdAt),
        shiftLetter,
        item.dskName || '-',
        item.vendorCode || '-',
        item.rootName || item.rootCode || '-',
        Number(item.grossWeight || 0).toFixed(1),
        String(item.noOfCans ?? 0),
        Number(item.fat || 0) > 0 ? Number(item.fat).toFixed(1) : '0.0',
        Number(item.snf || 0) > 0 ? Number(item.snf).toFixed(1) : '0.0',
        Number(item.netWeight || item.netLtr || 0).toFixed(1)
      ]
    })

    // 4. Define Footer Row
    const foot = [
      [
        {
          content: 'Total / Weighted Avg',
          colSpan: 6,
          styles: { halign: 'left' as const, fontStyle: 'bold' as const }
        },
        totals.totalGross,
        String(totals.totalCans),
        `${totals.avgFat}%`,
        `${totals.avgSnf}%`,
        totals.totalNet
      ]
    ]

    // 5. Generate Table matching the image
    autoTable(doc, {
      startY: 28,
      head: head,
      body: body,
      foot: foot,
      theme: 'plain',
      styles: {
        fontSize: 7.5,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.15,
        cellPadding: 1.1,
        font: 'helvetica'
      },
      headStyles: {
        fillColor: false,
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineColor: [0, 0, 0],
        lineWidth: 0.15
      },
      footStyles: {
        fillColor: false,
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineColor: [0, 0, 0],
        lineWidth: 0.15
      },
      columnStyles: {
        0: { halign: 'center' as const, cellWidth: 14 },
        1: { halign: 'center' as const, cellWidth: 18 },
        2: { halign: 'center' as const, cellWidth: 10 },
        3: { halign: 'left' as const, cellWidth: 34 },
        4: { halign: 'center' as const, cellWidth: 16 },
        5: { halign: 'left' as const, cellWidth: 26 },
        6: { halign: 'right' as const, cellWidth: 18 },
        7: { halign: 'center' as const, cellWidth: 14 },
        8: { halign: 'right' as const, cellWidth: 14 },
        9: { halign: 'right' as const, cellWidth: 14 },
        10: { halign: 'right' as const, cellWidth: 18 }
      },
      margin: { left: 7, right: 7, top: 10, bottom: 8 }
    })

    // Triggers native download, opening local folder save dialog
    doc.save(`Truck_Sheet_${appliedDate}_Shift_${appliedShift}.pdf`)
    toast.success('PDF export successfully!')
  }

  return (
    <div className="space-y-3">
      {/* Page Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb title="Truck Sheet Report" />

        <div className="flex items-center gap-2">
          <Button1
            variant="outline"
            icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
            label="Download Excel"
            onClick={handleDownloadExcel}
          />
          <Button1
            variant="outline"
            icon={<FileDown className="w-3.5 h-3.5 text-rose-600" />}
            label="Download PDF"
            onClick={handleDownloadPdf}
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        {/* Date & Shift Filter Bar */}
        <CustomForm onSubmit={handleSubmitFilter} className="w-full">
          <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-3 mb-3 items-end">
            {/* Date Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Date</label>
              <CustomForm.CustomDateField
                name="date"
                value={date}
                onChange={(e: any) => setDate(e.target.value)}
              />
            </div>

            {/* Shift Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Select Shift{' '}
                {loadingShifts && <span className="text-slate-400 font-normal">(Loading...)</span>}
              </label>
              <CustomForm.CustomSelectSearchField
                name="shift"
                value={shift}
                onChange={(e: any) => setShift(e.target.value)}
                options={shiftOptions}
                placeholder={loadingShifts ? 'Loading shifts...' : 'Select shift...'}
                disabled={loadingShifts}
              />
            </div>

            {/* Search Button */}
            <div className="flex items-end justify-start">
              <Button1
                variant="primary"
                type="submit"
                icon={<Search className="w-3.5 h-3.5 text-white" />}
                label={loading ? 'Searching...' : 'Search'}
                disabled={loading}
              />
            </div>
          </div>
        </CustomForm>

        {/* Table Toolbar */}
        <div>
          <TableToolbar
            pageSize={pageSize}
            onPageSizeChange={(val) => setPageSize(val === 'all' ? 'all' : Number(val))}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search sample no, DSK, route or code..."
          />
        </div>

        {/* Table View matching photo */}
        <div className="overflow-x-auto mt-2">
          <table id="truck-sheet-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-2 px-2 whitespace-nowrap">Sample No</th>
                <th className="py-2 px-2 whitespace-nowrap">Date</th>
                <th className="py-2 px-2 whitespace-nowrap">Shift</th>
                <th className="py-2 px-2 whitespace-nowrap">DSK Name</th>
                <th className="py-2 px-2 whitespace-nowrap">DSK Code</th>
                <th className="py-2 px-2 whitespace-nowrap">Route Name</th>
                <th className="py-2 px-2 whitespace-nowrap">Gross Weight</th>
                <th className="py-2 px-2 whitespace-nowrap">No. of Cans</th>
                <th className="py-2 px-2 whitespace-nowrap">FAT (%)</th>
                <th className="py-2 px-2 whitespace-nowrap">SNF (%)</th>
                <th className="py-2 px-2 whitespace-nowrap">Net Weight</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && (
                <tr>
                  <td colSpan={11} className="py-4 text-center text-slate-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                      <span>Loading truck sheet data...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && reportData.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-4 text-center text-slate-400 font-medium">
                    No truck sheet records found for the selected date and shift
                  </td>
                </tr>
              )}

              {!loading &&
                reportData.map((item, index) => (
                  <tr key={item.id ?? index} className="hover:bg-slate-50/70 transition">
                    <td className="py-2 px-2 font-semibold text-primary">{item.sampleCode}</td>
                    <td className="py-2 px-2 font-semibold text-primary">
                      {formatDateDDMMYYYY(item.sampleDate || item.createdAt)}
                    </td>
                    <td className="py-2 px-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-rose-50 text-rose-500 border-rose-200">
                        {item.shiftName || (Number(item.shift) === 1 ? 'Morning' : 'Evening')}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-semibold text-slate-800">{item.dskName || '-'}</td>
                    <td className="py-2 px-2 font-semibold text-primary">{item.vendorCode || '-'}</td>
                    <td className="py-2 px-2 font-semibold text-primary max-w-40 truncate">
                      {item.rootName || item.rootCode || '-'}
                    </td>
                    <td className="py-2 px-2 font-bold text-slate-800">
                      {Number(item.grossWeight || 0).toFixed(1)}
                    </td>
                    <td className="py-2 px-2 font-semibold text-primary">{item.noOfCans ?? 0}</td>
                    <td className="py-2 px-2 font-bold text-slate-800">
                      {Number(item.fat || 0) > 0 ? `${Number(item.fat).toFixed(1)}%` : '0.0%'}
                    </td>
                    <td className="py-2 px-2 font-bold text-slate-800">
                      {Number(item.snf || 0) > 0 ? `${Number(item.snf).toFixed(1)}%` : '0.0%'}
                    </td>
                    <td className="py-2 px-2 font-bold text-emerald-600">
                      {Number(item.netWeight || item.netLtr || 0).toFixed(1)}
                    </td>
                  </tr>
                ))}
            </tbody>

            {/* Summary Footer Row */}
            {reportData.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-800">
                  <td colSpan={6} className="py-2.5 px-2 uppercase text-slate-600 tracking-wider">
                    Total / Weighted Avg
                  </td>
                  <td className="py-2.5 px-2 font-bold text-slate-900">{totals.totalGross}</td>
                  <td className="py-2.5 px-2 font-semibold text-primary">{totals.totalCans}</td>
                  <td className="py-2.5 px-2 font-bold text-slate-900">{totals.avgFat}%</td>
                  <td className="py-2.5 px-2 font-bold text-slate-900">{totals.avgSnf}%</td>
                  <td className="py-2.5 px-2 font-bold text-emerald-600">{totals.totalNet}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Table Pagination */}
        <div>
          <TablePagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pageSize}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
            loading={loading}
            itemName="records"
            onPageChange={(newPage) =>
              fetchTruckReport(newPage, pageSize, searchQuery, appliedDate, appliedShift)
            }
          />
        </div>
      </div>
    </div>
  )
}

export default TruckReport