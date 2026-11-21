// import React, { useState, useEffect, useMemo } from 'react'
// import {
//   Printer,
//   FileSpreadsheet,
//   FileDown,
//   Search,
//   RefreshCw,
//   Calendar,
//   Layers
// } from 'lucide-react'
// import { toast } from 'react-toastify'
// import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
// import CustomForm from '@renderer/components/customform/CustomForm'
// import Button1 from '@renderer/components/buttons/Button1'
// import TablePagination from '@renderer/components/table/TablePagination'
// import TableToolbar from '@renderer/components/table/TableToolbar'
// import { useAuth } from '@renderer/context/AuthContext'
// import { useShift } from '@renderer/hooks/useShift'

// export interface TruckSheetItem {
//   id: number
//   transCode: string
//   plant: string
//   userCode: string
//   rootCode: string
//   rootName?: string | null
//   vendorCode: string
//   dskName?: string | null
//   shift: number
//   shiftName?: string | null
//   sampleDate: string
//   sampleCode: number | string
//   canType: string
//   weightSystem: string
//   milkType: string
//   milkTypeName?: string | null
//   milkStatus: string
//   milkStatusName?: string | null
//   tipingTime: string
//   noOfCans: number
//   grossWeight: number | string
//   netWeight: number | string
//   netLtr: number | string
//   fat: number | string
//   snf: number | string
//   clr: number | string
//   isAnalyse: number
//   entry: string
//   syncStatus: string
//   syncDate: string | null
//   createdAt: string
//   updatedAt: string
//   dFlag: number
// }

// export const TruckReport: React.FC = () => {
//   const { user } = useAuth()
//   const { shiftOptions, currentShiftId, loadingShifts } = useShift(user?.plant)

//   // Current Date in YYYY-MM-DD
//   const getCurrentDateISO = (): string => {
//     const today = new Date()
//     const year = today.getFullYear()
//     const month = String(today.getMonth() + 1).padStart(2, '0')
//     const day = String(today.getDate()).padStart(2, '0')
//     return `${year}-${month}-${day}`
//   }

//   // Convert Date to DD-MM-YYYY (e.g. 24-09-2026)
//   const formatDateDDMMYYYY = (dateVal?: string | Date): string => {
//     if (!dateVal) return '-'
//     const d = new Date(dateVal)
//     if (isNaN(d.getTime())) return String(dateVal)
//     const day = String(d.getDate()).padStart(2, '0')
//     const month = String(d.getMonth() + 1).padStart(2, '0')
//     const year = d.getFullYear()
//     return `${day}-${month}-${year}`
//   }

//   // Filter States
//   const [date, setDate] = useState<string>(getCurrentDateISO())
//   const [shift, setShift] = useState<string>(currentShiftId || '1')
//   const [isAnalyse, setIsAnalyse] = useState<string>('all') // 'all', '0', '1'
//   const [searchQuery, setSearchQuery] = useState<string>('')
//   const [pageSize, setPageSize] = useState<number | 'all'>(10)

//   // Applied Filter States
//   const [appliedDate, setAppliedDate] = useState<string>(getCurrentDateISO())
//   const [appliedShift, setAppliedShift] = useState<string>(currentShiftId || '1')
//   const [appliedAnalyse, setAppliedAnalyse] = useState<string>('all')

//   // Auto-sync active shift once loaded
//   useEffect(() => {
//     if (currentShiftId) {
//       setShift((prev) => prev || currentShiftId)
//       setAppliedShift((prev) => prev || currentShiftId)
//     }
//   }, [currentShiftId])

//   // Table Data & Pagination State
//   const [reportData, setReportData] = useState<TruckSheetItem[]>([])
//   const [loading, setLoading] = useState<boolean>(false)
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 10,
//     total: 0,
//     totalPages: 1,
//     hasNextPage: false,
//     hasPrevPage: false
//   })

//   // Inject print styles for perfect paper fit
//   useEffect(() => {
//     const style = document.createElement('style')
//     style.innerHTML = `
//       @media print {
//         @page {
//           size: A4 portrait;
//           margin: 8mm 8mm 8mm 8mm;
//         }
//         body {
//           print-color-adjust: exact;
//           -webkit-print-color-adjust: exact;
//           background: white !important;
//         }
//         .no-print {
//           display: none !important;
//         }
//         .print-only {
//           display: block !important;
//         }
//         thead {
//           display: table-header-group;
//         }
//         tfoot {
//           display: table-footer-group;
//         }
//         tr {
//           page-break-inside: avoid;
//         }
//         table {
//           width: 100% !important;
//           border-collapse: collapse !important;
//         }
//         th, td {
//           border: 1px solid #1e293b !important;
//         }
//       }
//       @media screen {
//         .print-only {
//           display: none;
//         }
//       }
//     `
//     document.head.appendChild(style)
//     return () => {
//       document.head.removeChild(style)
//     }
//   }, [])

//   // Fetch API Data
//   const fetchTruckReport = async (
//     pageNo = pagination.page,
//     limitVal = pageSize,
//     searchVal = searchQuery,
//     selectedDate = appliedDate,
//     selectedShift = appliedShift,
//     selectedAnalyse = appliedAnalyse
//   ): Promise<void> => {
//     try {
//       setLoading(true)
//       const actualLimit = limitVal === 'all' ? 1000000 : limitVal
//       const shiftNum =
//         selectedShift && selectedShift !== 'all' && Number(selectedShift) > 0
//           ? Number(selectedShift)
//           : undefined
//       const isAnalyseNum =
//         selectedAnalyse !== 'all' ? (Number(selectedAnalyse) === 1 ? 1 : 0) : undefined

//       if (typeof window !== 'undefined' && (window.api as any)?.getTruckSheetReport) {
//         const response = await (window.api as any).getTruckSheetReport(
//           {
//             page: pageNo,
//             limit: actualLimit,
//             search: searchVal.trim()
//           },
//           shiftNum,
//           selectedDate,
//           isAnalyseNum
//         )

//         if (response) {
//           const list: TruckSheetItem[] = Array.isArray(response.data)
//             ? response.data
//             : Array.isArray(response)
//               ? response
//               : []
//           setReportData(list)

//           if (response.pagination) {
//             setPagination(response.pagination)
//           }
//         }
//       } else {
//         toast.error('getTruckSheetReport API is not available on window.api')
//       }
//     } catch (error: any) {
//       console.error('Failed to load truck sheet report:', error)
//       toast.error(error?.message || 'Failed to load truck sheet report.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Trigger search on submit
//   const handleSearch = (e?: React.FormEvent) => {
//     if (e) e.preventDefault()
//     setAppliedDate(date)
//     setAppliedShift(shift)
//     setAppliedAnalyse(isAnalyse)
//     fetchTruckReport(1, pageSize, searchQuery, date, shift, isAnalyse)
//   }

//   // Debounced auto-fetch on search or page size change
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       fetchTruckReport(1, pageSize, searchQuery, appliedDate, appliedShift, appliedAnalyse)
//     }, 300)
//     return () => clearTimeout(timer)
//   }, [searchQuery, pageSize])

//   // Initial load
//   useEffect(() => {
//     fetchTruckReport(1, pageSize, searchQuery, getCurrentDateISO(), shift, isAnalyse)
//   }, [])

//   // Calculate Column Totals & Weighted Averages
//   const totals = useMemo(() => {
//     let totalGross = 0
//     let totalCans = 0
//     let totalNet = 0
//     let productFat = 0
//     let productSnf = 0

//     reportData.forEach((row) => {
//       const gross = Number(row.grossWeight) || 0
//       const net = Number(row.netWeight) || 0
//       const cans = Number(row.noOfCans) || 0
//       const fat = Number(row.fat) || 0
//       const snf = Number(row.snf) || 0

//       totalGross += gross
//       totalCans += cans
//       totalNet += net
//       productFat += net * fat
//       productSnf += net * snf
//     })

//     const avgFat = totalNet > 0 ? productFat / totalNet : 0
//     const avgSnf = totalNet > 0 ? productSnf / totalNet : 0

//     return {
//       totalGross: totalGross.toFixed(2),
//       totalCans,
//       totalNet: totalNet.toFixed(2),
//       avgFat: avgFat.toFixed(2),
//       avgSnf: avgSnf.toFixed(2)
//     }
//   }, [reportData])

//   // Download as Excel (.xls) file
//   const handleDownloadExcel = () => {
//     if (reportData.length === 0) {
//       toast.warn('No records available to export.')
//       return
//     }

//     const tableElement = document.getElementById('truck-sheet-table')
//     if (!tableElement) return

//     const plantId = user?.plant || '1207'
//     const plantName = user?.plantName || 'ARILO'

//     const excelTemplate = `
//       <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
//       <head>
//         <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
//         <style>
//           body { font-family: Arial, sans-serif; }
//           .header-title { font-size: 14px; font-weight: bold; text-align: center; }
//           .header-subtitle { font-size: 12px; font-weight: bold; text-align: center; }
//           table { border-collapse: collapse; width: 100%; margin-top: 10px; }
//           th, td { border: 1px solid #000; padding: 5px 8px; font-size: 11px; }
//           th { background-color: #f1f5f9; font-weight: bold; text-align: center; }
//           .text-left { text-align: left; }
//           .text-right { text-align: right; }
//           .text-center { text-align: center; }
//         </style>
//       </head>
//       <body>
//         <div class="header-title">PRAGATI MILK PRODUCTS PRIVATE LIMITED</div>
//         <div class="header-subtitle">CHILLING CENTER - ${plantId}, ${plantName}</div>
//         <div class="header-subtitle">TRUCK SHEET</div>
//         <br/>
//         ${tableElement.outerHTML}
//       </body>
//       </html>
//     `

//     const blob = new Blob(['\ufeff', excelTemplate], {
//       type: 'application/vnd.ms-excel;charset=utf-8;'
//     })
//     const url = URL.createObjectURL(blob)
//     const link = document.createElement('a')
//     link.href = url
//     link.download = `Truck_Sheet_${appliedDate}_Shift_${appliedShift}.xls`
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//     URL.revokeObjectURL(url)
//     toast.success('Excel report downloaded successfully!')
//   }

//   // Print & Save as PDF Trigger
//   const handlePrint = () => {
//     if (reportData.length === 0) {
//       toast.warn('No records available to print.')
//       return
//     }
//     window.print()
//   }

//   return (
//     <div className="space-y-4">
//       {/* Top Header & Action Buttons */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 no-print">
//         <PageBreadcrumb title="Truck Sheet Report" />

//         <div className="flex items-center gap-2">
//           <Button1
//             variant="outline"
//             icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
//             label="Download Excel"
//             onClick={handleDownloadExcel}
//           />
//           <Button1
//             variant="secondary"
//             icon={<FileDown className="w-3.5 h-3.5 text-rose-600" />}
//             label="Download PDF"
//             onClick={handlePrint}
//           />
//           <Button1
//             variant="primary"
//             icon={<Printer className="w-3.5 h-3.5 text-white" />}
//             label="Print"
//             onClick={handlePrint}
//           />
//         </div>
//       </div>

//       {/* Filter Card (Hidden during print) */}
//       <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs no-print">
//         <CustomForm onSubmit={handleSearch} className="w-full">
//           <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-3 items-end">
//             {/* Date Field */}
//             <div className="space-y-1.5">
//               <label className="text-xs font-semibold text-slate-700">Date</label>
//               <CustomForm.CustomDateField
//                 name="date"
//                 value={date}
//                 onChange={(e: any) => setDate(e.target.value)}
//               />
//             </div>

//             {/* Shift Field */}
//             <div className="space-y-1.5">
//               <label className="text-xs font-semibold text-slate-700">
//                 Select Shift{' '}
//                 {loadingShifts && <span className="text-slate-400 font-normal">(Loading...)</span>}
//               </label>
//               <CustomForm.CustomSelectSearchField
//                 name="shift"
//                 value={shift}
//                 onChange={(e: any) => setShift(e.target.value)}
//                 options={[
//                   { value: 'all', label: 'All Shifts' },
//                   ...(shiftOptions || [
//                     { value: '1', label: 'Morning' },
//                     { value: '2', label: 'Evening' }
//                   ])
//                 ]}
//                 placeholder="Select Shift..."
//               />
//             </div>

//             {/* Status (isAnalyse) */}
//             <div className="space-y-1.5">
//               <label className="text-xs font-semibold text-slate-700">Analysis Status</label>
//               <CustomForm.CustomSelectField
//                 name="isAnalyse"
//                 value={isAnalyse}
//                 onChange={(e: any) => setIsAnalyse(e.target.value)}
//                 options={[
//                   { value: 'all', label: 'All Records' },
//                   { value: '0', label: 'Pending (Unanalyzed)' },
//                   { value: '1', label: 'Analyzed' }
//                 ]}
//               />
//             </div>

//             {/* Search Button */}
//             <div className="flex items-end">
//               <Button1
//                 variant="primary"
//                 icon={<Search className="w-3.5 h-3.5 text-white" />}
//                 label={loading ? 'Searching...' : 'Search'}
//                 onClick={handleSearch}
//                 disabled={loading}
//               />
//             </div>
//           </div>
//         </CustomForm>
//       </div>

//       {/* Main Table Card (Designed to match the PDF/Print layout) */}
//       <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-100 shadow-xs print:p-0 print:border-none print:shadow-none">
//         {/* Printable Letterhead matching the exact image */}
//         {/* <div className="text-center mb-4 space-y-1">
//           <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-slate-900">
//             PRAGATI MILK PRODUCTS PRIVATE LIMITED
//           </h2>
//           <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-800">
//             CHILLING CENTER - {user?.plant }, {user?.plantName}
//           </h3>
//           <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900 underline decoration-slate-400 underline-offset-4">
//             TRUCK SHEET
//           </h4>
//         </div> */}

//         {/* Toolbar (Hidden during print) */}
//         <div className="no-print mb-3">
//           <TableToolbar
//             pageSize={pageSize}
//             onPageSizeChange={(val) => setPageSize(val === 'all' ? 'all' : Number(val))}
//             searchQuery={searchQuery}
//             onSearchChange={setSearchQuery}
//             searchPlaceholder="Search DSK name, code, route, or sample..."
//           />
//         </div>

//         {/* Table View matching the photo's exact columns */}
//         <div className="overflow-x-auto">
//           <table id="truck-sheet-table" className="w-full text-left border-collapse border border-slate-800 text-xs">
//             <thead>
//               <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-800 text-[11px]">
//                 <th className="border border-slate-800 py-1.5 px-2 text-center whitespace-nowrap">
//                   Sample No.
//                 </th>
//                 <th className="border border-slate-800 py-1.5 px-2 text-center whitespace-nowrap">
//                   Date
//                 </th>
//                 <th className="border border-slate-800 py-1.5 px-2 text-center whitespace-nowrap">
//                   Shift
//                 </th>
//                 <th className="border border-slate-800 py-1.5 px-2 text-left whitespace-nowrap">
//                   DSK Name
//                 </th>
//                 <th className="border border-slate-800 py-1.5 px-2 text-center whitespace-nowrap">
//                   DSK Code
//                 </th>
//                 <th className="border border-slate-800 py-1.5 px-2 text-left whitespace-nowrap">
//                   Route Name
//                 </th>
//                 <th className="border border-slate-800 py-1.5 px-2 text-right whitespace-nowrap">
//                   Gross Weight
//                 </th>
//                 <th className="border border-slate-800 py-1.5 px-2 text-center whitespace-nowrap">
//                   No Of Cans
//                 </th>
//                 <th className="border border-slate-800 py-1.5 px-2 text-right whitespace-nowrap">
//                   FAT %
//                 </th>
//                 <th className="border border-slate-800 py-1.5 px-2 text-right whitespace-nowrap">
//                   SNF %
//                 </th>
//                 <th className="border border-slate-800 py-1.5 px-2 text-right whitespace-nowrap">
//                   Net Weight
//                 </th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-slate-800 text-[11px]">
//               {loading ? (
//                 <tr>
//                   <td colSpan={11} className="py-6 text-center text-slate-500 font-medium">
//                     <div className="flex items-center justify-center gap-2">
//                       <RefreshCw className="w-4 h-4 animate-spin text-primary" />
//                       <span>Loading truck sheet data...</span>
//                     </div>
//                   </td>
//                 </tr>
//               ) : reportData.length === 0 ? (
//                 <tr>
//                   <td colSpan={11} className="py-6 text-center text-slate-500 font-medium">
//                     No truck sheet records found for the selected criteria.
//                   </td>
//                 </tr>
//               ) : (
//                 reportData.map((item, index) => {
//                   const shiftLetter = item.shiftName
//                     ? item.shiftName.toLowerCase().startsWith('m')
//                       ? 'M'
//                       : item.shiftName.toLowerCase().startsWith('e')
//                         ? 'E'
//                         : item.shiftName
//                     : Number(item.shift) === 1
//                       ? 'M'
//                       : 'E'

//                   return (
//                     <tr key={item.id ?? index} className="hover:bg-slate-50">
//                       <td className="border border-slate-800 py-1 px-2 text-center font-medium">
//                         {item.sampleCode || index + 1}
//                       </td>
//                       <td className="border border-slate-800 py-1 px-2 text-center whitespace-nowrap">
//                         {formatDateDDMMYYYY(item.sampleDate || item.createdAt)}
//                       </td>
//                       <td className="border border-slate-800 py-1 px-2 text-center font-bold">
//                         {shiftLetter}
//                       </td>
//                       <td className="border border-slate-800 py-1 px-2 font-medium">
//                         {item.dskName || '-'}
//                       </td>
//                       <td className="border border-slate-800 py-1 px-2 text-center">
//                         {item.vendorCode || '-'}
//                       </td>
//                       <td className="border border-slate-800 py-1 px-2 font-medium">
//                         {item.rootName || item.rootCode || '-'}
//                       </td>
//                       <td className="border border-slate-800 py-1 px-2 text-right tabular-nums">
//                         {Number(item.grossWeight || 0).toFixed(2)}
//                       </td>
//                       <td className="border border-slate-800 py-1 px-2 text-center font-semibold tabular-nums">
//                         {item.noOfCans ?? 0}
//                       </td>
//                       <td className="border border-slate-800 py-1 px-2 text-right tabular-nums">
//                         {Number(item.fat || 0).toFixed(2)}
//                       </td>
//                       <td className="border border-slate-800 py-1 px-2 text-right tabular-nums">
//                         {Number(item.snf || 0).toFixed(2)}
//                       </td>
//                       <td className="border border-slate-800 py-1 px-2 text-right font-bold tabular-nums">
//                         {Number(item.netWeight || 0).toFixed(2)}
//                       </td>
//                     </tr>
//                   )
//                 })
//               )}
//             </tbody>

//             {/* Summary Footer Row */}
//             {reportData.length > 0 && (
//               <tfoot>
//                 <tr className="bg-slate-100 font-bold border-t-2 border-slate-800 text-[11px]">
//                   <td colSpan={6} className="border border-slate-800 py-1.5 px-2 text-center uppercase tracking-wider">
//                     Total / Weighted Avg
//                   </td>
//                   <td className="border border-slate-800 py-1.5 px-2 text-right tabular-nums">
//                     {totals.totalGross}
//                   </td>
//                   <td className="border border-slate-800 py-1.5 px-2 text-center tabular-nums">
//                     {totals.totalCans}
//                   </td>
//                   <td className="border border-slate-800 py-1.5 px-2 text-right tabular-nums">
//                     {totals.avgFat}
//                   </td>
//                   <td className="border border-slate-800 py-1.5 px-2 text-right tabular-nums">
//                     {totals.avgSnf}
//                   </td>
//                   <td className="border border-slate-800 py-1.5 px-2 text-right tabular-nums font-extrabold text-slate-900">
//                     {totals.totalNet}
//                   </td>
//                 </tr>
//               </tfoot>
//             )}
//           </table>
//         </div>

//         {/* Pagination (Hidden during print) */}
//         <div className="no-print mt-3">
//           <TablePagination
//             page={pagination.page}
//             totalPages={pagination.totalPages}
//             totalItems={pagination.total}
//             pageSize={pageSize}
//             hasNextPage={pagination.hasNextPage}
//             hasPrevPage={pagination.hasPrevPage}
//             loading={loading}
//             itemName="truck sheet records"
//             onPageChange={(newPage) =>
//               fetchTruckReport(newPage, pageSize, searchQuery, appliedDate, appliedShift, appliedAnalyse)
//             }
//           />
//         </div>
//       </div>
//     </div>
//   )
// }

// export default TruckReport



import React, { useState, useEffect, useMemo } from 'react'
import {
  Printer,
  FileSpreadsheet,
  FileDown,
  Search,
  RefreshCw
} from 'lucide-react'
import { toast } from 'react-toastify'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import CustomForm from '@renderer/components/customform/CustomForm'
import Button1 from '@renderer/components/buttons/Button1'
import TablePagination from '@renderer/components/table/TablePagination'
import TableToolbar from '@renderer/components/table/TableToolbar'
import { useAuth } from '@renderer/context/AuthContext'
import { useShift } from '@renderer/hooks/useShift'

export interface TruckSheetItem {
  id: number
  transCode: string
  plant: string
  userCode: string
  rootCode: string
  rootName?: string | null
  vendorCode: string
  dskName?: string | null
  shift: number
  shiftName?: string | null
  sampleDate: string
  sampleCode: number | string
  canType: string
  weightSystem: string
  milkType: string
  milkTypeName?: string | null
  milkStatus: string
  milkStatusName?: string | null
  tipingTime: string
  noOfCans: number
  grossWeight: number | string
  netWeight: number | string
  netLtr: number | string
  fat: number | string
  snf: number | string
  clr: number | string
  isAnalyse: number
  entry: string
  syncStatus: string
  syncDate: string | null
  createdAt: string
  updatedAt: string
  dFlag: number
}

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
      year: '2-digit'
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
  const [reportData, setReportData] = useState<TruckSheetItem[]>([])
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

  // Print Styles Setup
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      @media print {
        @page {
          size: A4 portrait;
          margin: 8mm;
        }
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
          background: white !important;
        }
        .no-print {
          display: none !important;
        }
        thead {
          display: table-header-group;
        }
        tfoot {
          display: table-footer-group;
        }
        tr {
          page-break-inside: avoid;
        }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Fetch Report from API
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
          const list: TruckSheetItem[] = Array.isArray(response.data)
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

  // Download Excel (.xls) file
  const handleDownloadExcel = () => {
    if (reportData.length === 0) {
      toast.warn('No records available to export.')
      return
    }

    const tableElement = document.getElementById('truck-sheet-table')
    if (!tableElement) return

    const plantId = user?.plant || '1207'
    const plantName = user?.plantName || 'ARILO'

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
          body { font-family: Arial, sans-serif; }
          .header-title { font-size: 14px; font-weight: bold; text-align: center; }
          .header-subtitle { font-size: 12px; font-weight: bold; text-align: center; }
          table { border-collapse: collapse; width: 100%; margin-top: 10px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; }
          th { background-color: #f1f5f9; font-weight: bold; text-align: left; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
        </style>
      </head>
      <body>
        <div class="header-title">PRAGATI MILK PRODUCTS PRIVATE LIMITED</div>
        <div class="header-subtitle">CHILLING CENTER - ${plantId}, ${plantName}</div>
        <div class="header-subtitle">TRUCK SHEET</div>
        <br/>
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

  // Print & PDF Handler
  const handlePrint = () => {
    if (reportData.length === 0) {
      toast.warn('No records available to print.')
      return
    }
    window.print()
  }

  return (
    <div className="space-y-3">
      {/* Page Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <PageBreadcrumb title="Truck Sheet Report" />

        <div className="flex items-center gap-2">
          <Button1
            variant="outline"
            icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
            label="Download Excel"
            onClick={handleDownloadExcel}
          />
          <Button1
            variant="secondary"
            icon={<FileDown className="w-3.5 h-3.5 text-rose-600" />}
            label="Download PDF"
            onClick={handlePrint}
          />
          <Button1
            variant="primary"
            icon={<Printer className="w-3.5 h-3.5 text-white" />}
            label="Print"
            onClick={handlePrint}
          />
        </div>
      </div>

      {/* Main Table Card (matching Analyzed.tsx) */}
      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs print:p-0 print:border-none print:shadow-none">
        {/* Single Date & Shift Filter Bar */}
        <CustomForm onSubmit={handleSubmitFilter} className="w-full no-print">
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
                icon={<Search className="w-3.5 h-3.5 text-white" />}
                label={loading ? 'Searching...' : 'Search'}
                onClick={handleSubmitFilter}
                disabled={loading}
              />
            </div>
          </div>
        </CustomForm>

        {/* Table Toolbar */}
        <div className="no-print">
          <TableToolbar
            pageSize={pageSize}
            onPageSizeChange={(val) => setPageSize(val === 'all' ? 'all' : Number(val))}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search sample no, DSK, route or code..."
          />
        </div>

        {/* Print Letterhead (Only visible during print / PDF) */}
        <div className="hidden print:block text-center my-3 space-y-1">
          <h2 className="text-base font-extrabold uppercase text-slate-900">
            PRAGATI MILK PRODUCTS PRIVATE LIMITED
          </h2>
          <h3 className="text-xs font-bold uppercase text-slate-800">
            CHILLING CENTER - {user?.plant || '1207'}, {user?.plantName || 'ARILO'}
          </h3>
          <h4 className="text-xs font-extrabold uppercase text-slate-900 underline underline-offset-4">
            TRUCK SHEET
          </h4>
        </div>

        {/* Table Matching Analyzed.tsx Design */}
        <div className="overflow-x-auto">
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
        <div className="no-print">
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