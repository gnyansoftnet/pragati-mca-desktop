import React, { useState, useEffect, useMemo } from 'react'
import { FileSpreadsheet, FileDown, Search } from 'lucide-react'
import { toast } from 'react-toastify'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import CustomForm from '@renderer/components/customform/CustomForm'
import Button1 from '@renderer/components/buttons/Button1'
import TableToolbar from '@renderer/components/table/TableToolbar'
import TablePagination from '@renderer/components/table/TablePagination'
import { useAuth } from '@renderer/context/AuthContext'
import { useShift } from '@renderer/hooks/useShift'
import { MilkRejectionResponseDto } from '@shared/dtos/milk-collection/milk-rejection.dto'

import { RejectionPrintButton } from '@renderer/components/rejectionreport/RejectionPrintButton'
import { RejectionPdfButton } from '@renderer/components/rejectionreport/RejectionPdfButton'

export const RejectionReport: React.FC = () => {
  const { user } = useAuth()
  const { shiftOptions, currentShiftId, loadingShifts, getShiftLabel } = useShift(user?.plant)

  const shiftOptionsWithAll = [{ value: '', label: 'All Shifts' }, ...shiftOptions]

  // console.log('shiftOptions', shiftOptions)
  // Format today's date as YYYY-MM-DD
  const getCurrentLocalDate = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Convert YYYY-MM-DD to DD-MM-YYYY for display
  const formatDateForDisplay = (dateStr?: string): string => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`
    }
    return dateStr
  }

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
  const [date, setDate] = useState<string>(getCurrentLocalDate())
  const [shift, setShift] = useState<string>('')

  // Applied filter states (locked until user clicks Search)
  const [appliedDate, setAppliedDate] = useState<string>(getCurrentLocalDate())
  const [appliedShift, setAppliedShift] = useState<string>('')

  // useEffect(() => {
  //   if (currentShiftId) {
  //     setShift((prev) => prev || currentShiftId)
  //     setAppliedShift((prev) => prev || currentShiftId)
  //   }
  // }, [currentShiftId])

  const [rejections, setRejections] = useState<MilkRejectionResponseDto[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const [pageSize, setPageSize] = useState<number | 'all'>(10)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Fetch paginated rejections
  const fetchPaginatedRejections = async (
    pageNo = pagination.page,
    limitVal = pageSize,
    searchVal = searchQuery,
    selectedShift = appliedShift,
    selectedDate = appliedDate
  ) => {
    try {
      setLoading(true)
      const actualLimit = limitVal === 'all' ? 1000000000 : limitVal
      const response = await window.api.getPaginatedMilkRejections(
        {
          page: pageNo,
          limit: actualLimit,
          search: searchVal.trim()
        },
        selectedShift ? Number(selectedShift) : undefined,
        selectedDate
      )

      if (response) {
        const dataList = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : []
        setRejections(dataList)

        if (response.pagination) {
          setPagination(response.pagination)
        }
      }
    } catch (error) {
      console.error('Failed to fetch milk rejections:', error)
      toast.error('Failed to fetch milk rejections.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!date) {
      toast.warn('Please select a date.')
      return
    }
    setAppliedDate(date)
    setAppliedShift(shift)
    fetchPaginatedRejections(1, pageSize, searchQuery, shift, date)
  }

  // Initial load & debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPaginatedRejections(1, pageSize, searchQuery, appliedShift, appliedDate)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, pageSize, appliedShift, appliedDate])

  // Column Totals
  const totals = useMemo(() => {
    let totalCans = 0
    let totalAproxQty = 0

    rejections.forEach((item) => {
      totalCans += Number(item.noOfCanes) || 0
      totalAproxQty += Number(item.aproxQuantity) || 0
    })

    return {
      totalCans,
      totalAproxQty: totalAproxQty.toFixed(1)
    }
  }, [rejections])

  // Download Excel (.xls)
  const handleDownloadExcel = () => {
    if (rejections.length === 0) {
      toast.warn('No records available to export.')
      return
    }

    const tableElement = document.getElementById('rejection-report-table')
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
    link.download = `Rejection_Report_${appliedDate}_Shift_${appliedShift || 'All'}.xls`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Excel export successfully!')
  }

  // Download PDF (Landscape A4 matching TruckReport letterhead styling)
  const handleDownloadPdf = () => {
    if (rejections.length === 0) {
      toast.warn('No records available to download as PDF.')
      return
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const plantId = user?.plant || '1207'
    const plantName = user?.plantName || 'ARILO'

    // 1. Top Letterhead
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('PRAGATI MILK PRODUCTS PRIVATE LIMITED', 148.5, 11, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`CHILLING CENTER - ${plantId}, ${plantName}`, 148.5, 16, { align: 'center' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('REJECTION REPORT', 148.5, 21, { align: 'center' })

    const shiftLabel =
      appliedShift === '1'
        ? 'Morning'
        : appliedShift === '2'
          ? 'Evening'
          : appliedShift
            ? getShiftLabel(appliedShift)
            : 'All Shifts'

    const dateHeaderStr = `Date: ${formatDateForDisplay(appliedDate)}    |    Shift: ${shiftLabel}`

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.text(dateHeaderStr, 148.5, 25.5, { align: 'center' })

    // 2. Table Headers
    const head = [
      [
        { content: 'ID', styles: { halign: 'center' as const } },
        { content: 'Date', styles: { halign: 'center' as const } },
        { content: 'Shift', styles: { halign: 'center' as const } },
        { content: 'Plant', styles: { halign: 'center' as const } },
        { content: 'Route Name', styles: { halign: 'left' as const } },
        { content: 'DSK Code', styles: { halign: 'center' as const } },
        { content: 'DSK Name', styles: { halign: 'left' as const } },
        { content: 'Supervisor', styles: { halign: 'left' as const } },
        { content: 'No. of Cans', styles: { halign: 'center' as const } },
        { content: 'Approx Qty (LTR)', styles: { halign: 'right' as const } },
        { content: 'Reason', styles: { halign: 'left' as const } },
        { content: 'Status', styles: { halign: 'center' as const } }
      ]
    ]

    // 3. Table Rows
    const body = rejections.map((item) => [
      String(item.id ?? ''),
      formatDateDDMMYYYY(item.createdAt),
      String(item.shiftName || item.shift || ''),
      String(item.plant || ''),
      String((item as any).routeName || item.route || '-'),
      String(item.dskCode || '-'),
      String(item.dskName || '-'),
      String(item.supervisor || '-'),
      String(item.noOfCanes ?? 0),
      Number(item.aproxQuantity || 0).toFixed(1),
      String(item.reason || '-'),
      item.syncStatus === 'synced' || item.syncStatus === '1' ? 'Synced' : 'Pending'
    ])

    // 4. Footer Row
    const foot = [
      [
        {
          content: 'Total',
          colSpan: 8,
          styles: { halign: 'right' as const, fontStyle: 'bold' as const }
        },
        {
          content: String(totals.totalCans),
          styles: { halign: 'center' as const, fontStyle: 'bold' as const }
        },
        {
          content: totals.totalAproxQty,
          styles: { halign: 'right' as const, fontStyle: 'bold' as const }
        },
        { content: '', colSpan: 2 }
      ]
    ]

    // 5. Generate Table
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
        cellPadding: 1.2,
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
        0: { halign: 'center' as const, cellWidth: 12 },
        1: { halign: 'center' as const, cellWidth: 20 },
        2: { halign: 'center' as const, cellWidth: 16 },
        3: { halign: 'center' as const, cellWidth: 16 },
        4: { halign: 'left' as const, cellWidth: 32 },
        5: { halign: 'center' as const, cellWidth: 20 },
        6: { halign: 'left' as const, cellWidth: 36 },
        7: { halign: 'left' as const, cellWidth: 26 },
        8: { halign: 'center' as const, cellWidth: 20 },
        9: { halign: 'right' as const, cellWidth: 26 },
        10: { halign: 'left' as const, cellWidth: 36 },
        11: { halign: 'center' as const, cellWidth: 18 }
      },
      margin: { left: 9, right: 9, top: 10, bottom: 8 }
    })

    doc.save(`Rejection_Report_${appliedDate}_Shift_${appliedShift || 'All'}.pdf`)
    toast.success('PDF export successfully!')
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb title="Rejection Report" />

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
        {/* Single Date & Shift Filter Bar */}
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
                options={shiftOptionsWithAll}
                placeholder={loadingShifts ? 'Loading shifts...' : 'Select shift...'}
                disabled={loadingShifts}
              />
            </div>

            {/* Search Button */}
            <div className="flex items-end justify-start">
              <Button1
                variant="primary"
                icon={<Search className="w-3.5 h-3.5 text-white" />}
                label={loading ? 'Searching...' : 'Search'}
                onClick={handleSubmitFilter}
                disabled={loading}
              />
            </div>
          </div>
        </CustomForm>

        <TableToolbar
          pageSize={pageSize}
          onPageSizeChange={(val) => setPageSize(val === 'all' ? 'all' : Number(val))}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search DSK, route or supervisor..."
        />

        {/* Table Following Rejection Columns */}
        <div className="overflow-x-auto">
          <table id="rejection-report-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                {/* <th className="py-2 px-2 whitespace-nowrap">ID</th> */}
                <th className="py-2 px-2 whitespace-nowrap">Date</th>
                <th className="py-2 px-2 whitespace-nowrap">Shift</th>
                <th className="py-2 px-2 whitespace-nowrap">Plant Id</th>
                <th className="py-2 px-2 whitespace-nowrap">Route Name</th>
                <th className="py-2 px-2 whitespace-nowrap">DSK Code</th>
                <th className="py-2 px-2 whitespace-nowrap">DSK Name</th>
                <th className="py-2 px-2 whitespace-nowrap">Supervisor</th>
                <th className="py-2 px-2 whitespace-nowrap">No. of Cans</th>
                <th className="py-2 px-2 whitespace-nowrap">Approx Qty (LTR)</th>
                <th className="py-2 px-2 whitespace-nowrap">Reason</th>
                <th className="py-2 px-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && (
                <tr>
                  <td colSpan={12} className="py-4 text-center text-slate-400 font-medium">
                    Loading rejections...
                  </td>
                </tr>
              )}
              {!loading && rejections.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-4 text-center text-slate-400 font-medium">
                    No milk rejections found for the selected date and shift
                  </td>
                </tr>
              )}
              {!loading &&
                rejections.map((item, index) => (
                  <tr key={item.id ?? index} className="hover:bg-slate-50/70 transition">
                    {/* <td className="py-2 px-2 font-semibold text-primary">{item.id}</td> */}
                    <td className="py-2 px-2 text-slate-700">
                      {item.createdAt
                        ? (() => {
                            const d = new Date(item.createdAt)
                            return isNaN(d.getTime())
                              ? String(item.createdAt)
                              : d.toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit'
                                })
                          })()
                        : ''}
                    </td>
                    <td className="py-2 px-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-rose-50 text-rose-500 border-rose-200">
                        {item.shiftName}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-semibold text-slate-800">{item.plant}</td>
                    <td className="py-2 px-2 font-semibold text-primary">
                      {(item as any).routeName || item.route}
                    </td>
                    <td className="py-2 px-2 text-slate-700">{item.dskCode}</td>
                    <td className="py-2 px-2 font-semibold text-slate-800">{item.dskName}</td>
                    <td className="py-2 px-2 text-slate-700">{item.supervisor}</td>

                    <td className="py-2 px-2 text-slate-700">{item.noOfCanes}</td>
                    <td className="py-2 px-2 font-bold text-emerald-600">
                      {Number(item.aproxQuantity || 0).toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-slate-700">{item.reason}</td>
                    <td className="py-2 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <RejectionPrintButton item={item} user={user} />
                        <RejectionPdfButton item={item} user={user} />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
            {rejections.length > 0 && (
              <tfoot className="bg-slate-50 border-t-2 border-slate-200 text-xs font-bold text-slate-800">
                <tr>
                  <td colSpan={8} className="py-2.5 px-2 text-right">
                    Total:
                  </td>
                  <td className="py-2.5 px-2 text-slate-700">{totals.totalCans}</td>
                  <td className="py-2.5 px-2 text-emerald-600">{totals.totalAproxQty}</td>
                  <td colSpan={2} className="py-2.5 px-2"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Table Pagination */}
        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pageSize}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          loading={loading}
          itemName="rejections"
          onPageChange={(newPage) =>
            fetchPaginatedRejections(newPage, pageSize, searchQuery, appliedShift, appliedDate)
          }
        />
      </div>
    </div>
  )
}

export default RejectionReport
