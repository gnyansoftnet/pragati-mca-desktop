// import React, { useState, useEffect, useMemo } from 'react'
// import { Search, Printer, FileSpreadsheet, FileDown, RefreshCw } from 'lucide-react'
// import { toast } from 'react-toastify'
// import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
// import CustomForm from '@renderer/components/customform/CustomForm'
// import Button1 from '@renderer/components/buttons/Button1'
// import { PeriodicReportDto } from '@shared/dtos/reports/periodic-report.dto'

// export const PeriodicReport: React.FC = () => {
//   const getCurrentDateISO = (): string => {
//     const today = new Date()
//     const year = today.getFullYear()
//     const month = String(today.getMonth() + 1).padStart(2, '0')
//     const day = String(today.getDate()).padStart(2, '0')
//     return `${year}-${month}-${day}`
//   }

//   const formatDisplayDate = (dStr: string): string => {
//     if (!dStr) return ''
//     const parts = dStr.split('-')
//     if (parts.length === 3) {
//       return `${parts[2]}-${parts[1]}-${parts[0]}`
//     }
//     return dStr
//   }

//   const [fromDate, setFromDate] = useState<string>(getCurrentDateISO())
//   const [toDate, setToDate] = useState<string>(getCurrentDateISO())

//   const [reportData, setReportData] = useState<PeriodicReportDto[]>([])
//   const [loading, setLoading] = useState<boolean>(false)

//   const fetchReport = async (start = fromDate, end = toDate): Promise<void> => {
//     if (!start || !end) {
//       toast.warn('Please select both From Date and To Date.')
//       return
//     }

//     try {
//       setLoading(true)
//       if (typeof window !== 'undefined' && (window.api as any)?.getPeriodicReport) {
//         const response = await (window.api as any).getPeriodicReport(start, end)
//         const list = Array.isArray(response)
//           ? response
//           : Array.isArray(response?.data)
//             ? response.data
//             : []
//         setReportData(list)
//       } else {
//         toast.error('getPeriodicReport API is not available on window.api.')
//       }
//     } catch (error: any) {
//       console.error('Failed to load periodic report:', error)
//       toast.error(error?.message || 'Failed to load periodic report.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchReport(getCurrentDateISO(), getCurrentDateISO())
//   }, [])

//   const handleSearch = (e?: React.FormEvent) => {
//     if (e) e.preventDefault()
//     fetchReport(fromDate, toDate)
//   }

//   // Calculate dynamic summary totals & weighted averages
//   const totals = useMemo(() => {
//     let morningTotalKg = 0
//     let morningProductFat = 0
//     let morningProductSnf = 0

//     let eveningTotalKg = 0
//     let eveningProductFat = 0
//     let eveningProductSnf = 0

//     let combinedTotalKg = 0
//     let combinedProductFat = 0
//     let combinedProductSnf = 0

//     reportData.forEach((item) => {
//       const mKg = Number(item.morning?.Total_KG) || 0
//       const mFat = Number(item.morning?.fatavg) || 0
//       const mSnf = Number(item.morning?.snfAvg) || 0

//       const eKg = Number(item.evening?.Total_KG) || 0
//       const eFat = Number(item.evening?.fatavg) || 0
//       const eSnf = Number(item.evening?.snfAvg) || 0

//       morningTotalKg += mKg
//       morningProductFat += mKg * mFat
//       morningProductSnf += mKg * mSnf

//       eveningTotalKg += eKg
//       eveningProductFat += eKg * eFat
//       eveningProductSnf += eKg * eSnf

//       const rowTotalKg = mKg + eKg
//       combinedTotalKg += rowTotalKg
//       combinedProductFat += mKg * mFat + eKg * eFat
//       combinedProductSnf += mKg * mSnf + eKg * eSnf
//     })

//     const morningAvgFat = morningTotalKg > 0 ? morningProductFat / morningTotalKg : 0
//     const morningAvgSnf = morningTotalKg > 0 ? morningProductSnf / morningTotalKg : 0

//     const eveningAvgFat = eveningTotalKg > 0 ? eveningProductFat / eveningTotalKg : 0
//     const eveningAvgSnf = eveningTotalKg > 0 ? eveningProductSnf / eveningTotalKg : 0

//     const combinedAvgFat = combinedTotalKg > 0 ? combinedProductFat / combinedTotalKg : 0
//     const combinedAvgSnf = combinedTotalKg > 0 ? combinedProductSnf / combinedTotalKg : 0

//     return {
//       morningTotalKg,
//       morningAvgFat,
//       morningAvgSnf,
//       eveningTotalKg,
//       eveningAvgFat,
//       eveningAvgSnf,
//       combinedTotalKg,
//       combinedAvgFat,
//       combinedAvgSnf
//     }
//   }, [reportData])

//   // Download as Excel (.xls) file preserving 2-tier headers
//   const handleDownloadExcel = () => {
//     if (reportData.length === 0) {
//       toast.warn('No data available to export.')
//       return
//     }

//     const tableElement = document.getElementById('periodic-report-table')
//     if (!tableElement) return

//     const excelTemplate = `
//       <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
//       <head>
//         <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
//         <style>
//           table { border-collapse: collapse; width: 100%; }
//           th, td { border: 1px solid #cbd5e1; padding: 6px 10px; font-family: Arial, sans-serif; font-size: 11px; }
//           th { background-color: #f1f5f9; font-weight: bold; }
//           .text-right { text-align: right; }
//           .text-left { text-align: left; }
//           .text-center { text-align: center; }
//         </style>
//       </head>
//       <body>
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
//     link.download = `Periodic_Report_${fromDate}_to_${toDate}.xls`
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//     URL.revokeObjectURL(url)
//     toast.success('Excel report export successfully!')
//   }

//   // Print handler
//   // const handlePrint = () => {
//   //   if (reportData.length === 0) {
//   //     toast.warn('No records to print.')
//   //     return
//   //   }
//   //   window.print()
//   // }

//   return (
//     <div className="space-y-4">
//       {/* Top Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//         <PageBreadcrumb title="Periodic Report" />

//         {/* Action Buttons */}
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
//             // onClick={handlePrint}
//           />
//           <Button1
//             variant="primary"
//             icon={<Printer className="w-3.5 h-3.5 text-white" />}
//             label="Print"
//             // onClick={handlePrint}
//           />
//         </div>
//       </div>

//       <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-3">
//         <CustomForm onSubmit={handleSearch} className="w-full">
//           <div className="flex flex-col sm:flex-row sm:items-end gap-3">
//             {/* From Date */}
//             <div className="w-full sm:w-48 space-y-1">
//               <label className="text-xs font-semibold text-slate-700">From Date</label>
//               <CustomForm.CustomDateField
//                 name="fromDate"
//                 value={fromDate}
//                 onChange={(e: any) => setFromDate(e.target.value)}
//               />
//             </div>

//             {/* To Date */}
//             <div className="w-full sm:w-48 space-y-1">
//               <label className="text-xs font-semibold text-slate-700">To Date</label>
//               <CustomForm.CustomDateField
//                 name="toDate"
//                 value={toDate}
//                 onChange={(e: any) => setToDate(e.target.value)}
//               />
//             </div>

//             {/* Search Button */}
//             <div className="pt-2 sm:pt-0">
//               <Button1
//                 variant="primary"
//                 type="submit"
//                 disabled={loading}
//                 icon={
//                   loading ? (
//                     <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
//                   ) : (
//                     <Search className="w-3.5 h-3.5 text-white" />
//                   )
//                 }
//                 label={loading ? 'Searching...' : 'Search'}
//               />
//             </div>
//           </div>
//         </CustomForm>
//         <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
//           <div className="flex items-center gap-2">
//             <h2 className="text-sm font-bold text-slate-800">Route-wise Periodic Summary</h2>
//             <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
//               {formatDisplayDate(fromDate)} &mdash; {formatDisplayDate(toDate)}
//             </span>
//           </div>

//           <div className="text-xs text-slate-500 font-medium">
//             Total Routes: <strong className="text-slate-800">{reportData.length}</strong>
//           </div>
//         </div>

//         {/* Responsive Table */}
//         <div className="overflow-x-auto">
//           <table id="periodic-report-table" className="w-full text-left border-collapse">
//             <thead>
//               {/* Tier 1 Header */}
//               <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
//                 <th
//                   rowSpan={2}
//                   className="py-2.5 px-3 whitespace-nowrap border-r border-slate-200 align-middle"
//                 >
//                   <span className="font-bold text-md">Route Name</span>
//                 </th>
//                 <th
//                   colSpan={3}
//                   className="py-2 px-3 text-center border-r border-slate-200 bg-blue-50/50 text-blue-900"
//                 >
//                   Morning
//                 </th>
//                 <th
//                   colSpan={3}
//                   className="py-2 px-3 text-center border-r border-slate-200 bg-amber-50/50 text-amber-900"
//                 >
//                   Evening
//                 </th>
//                 <th colSpan={3} className="py-2 px-3 text-center bg-emerald-50/50 text-emerald-900">
//                   Total
//                 </th>
//               </tr>

//               {/* Tier 2 Header */}
//               <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
//                 {/* Morning */}
//                 <th className="py-2 px-3 text-right">KG</th>
//                 <th className="py-2 px-3 text-right">FAT (%)</th>
//                 <th className="py-2 px-3 text-right border-r border-slate-200">SNF (%)</th>

//                 {/* Evening */}
//                 <th className="py-2 px-3 text-right">KG</th>
//                 <th className="py-2 px-3 text-right">FAT (%)</th>
//                 <th className="py-2 px-3 text-right border-r border-slate-200">SNF (%)</th>

//                 {/* Total */}
//                 <th className="py-2 px-3 text-right">KG</th>
//                 <th className="py-2 px-3 text-right">FAT (%)</th>
//                 <th className="py-2 px-3 text-right">SNF (%)</th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-slate-100 text-xs">
//               {loading && (
//                 <tr>
//                   <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
//                     Loading periodic report data...
//                   </td>
//                 </tr>
//               )}

//               {!loading && reportData.length === 0 && (
//                 <tr>
//                   <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
//                     No periodic collection records found for the period{' '}
//                     {formatDisplayDate(fromDate)} to {formatDisplayDate(toDate)}
//                   </td>
//                 </tr>
//               )}

//               {!loading &&
//                 reportData.map((item, index) => {
//                   const mKg = Number(item.morning?.Total_KG) || 0
//                   const mFat = Number(item.morning?.fatavg) || 0
//                   const mSnf = Number(item.morning?.snfAvg) || 0

//                   const eKg = Number(item.evening?.Total_KG) || 0
//                   const eFat = Number(item.evening?.fatavg) || 0
//                   const eSnf = Number(item.evening?.snfAvg) || 0

//                   const rowTotalKg = mKg + eKg
//                   const rowTotalFat = rowTotalKg > 0 ? (mKg * mFat + eKg * eFat) / rowTotalKg : 0
//                   const rowTotalSnf = rowTotalKg > 0 ? (mKg * mSnf + eKg * eSnf) / rowTotalKg : 0

//                   return (
//                     <tr key={item.route_code || index} className="hover:bg-slate-50/80 transition">
//                       {/* Route Name & Code */}
//                       <td className="py-2.5 px-3 font-semibold text-primary whitespace-nowrap border-r border-slate-100">
//                         {item.route_name || item.route_code}
//                         {item.route_name && item.route_code && (
//                           <span className="ml-1.5 text-[10px] text-slate-400 font-normal">
//                             ({item.route_code})
//                           </span>
//                         )}
//                       </td>

//                       {/* Morning Metrics */}
//                       <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
//                         {mKg.toFixed(2)}
//                       </td>
//                       <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
//                         {mFat.toFixed(2)}
//                       </td>
//                       <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 border-r border-slate-100">
//                         {mSnf.toFixed(2)}
//                       </td>

//                       {/* Evening Metrics */}
//                       <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
//                         {eKg.toFixed(2)}
//                       </td>
//                       <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
//                         {eFat.toFixed(2)}
//                       </td>
//                       <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 border-r border-slate-100">
//                         {eSnf.toFixed(2)}
//                       </td>

//                       {/* Total Metrics */}
//                       <td className="py-2.5 px-3 text-right tabular-nums font-bold text-emerald-600 bg-slate-50/30">
//                         {rowTotalKg.toFixed(2)}
//                       </td>
//                       <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-800 bg-slate-50/30">
//                         {rowTotalFat.toFixed(2)}
//                       </td>
//                       <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-800 bg-slate-50/30">
//                         {rowTotalSnf.toFixed(2)}
//                       </td>
//                     </tr>
//                   )
//                 })}
//             </tbody>

//             {/* Total Footer Row */}
//             {!loading && reportData.length > 0 && (
//               <tfoot>
//                 <tr className="bg-slate-100/80 border-t-2 border-slate-300 font-bold text-xs text-slate-900">
//                   <td className="py-2.5 px-3 border-r border-slate-200">Total</td>

//                   {/* Morning Totals */}
//                   <td className="py-2.5 px-3 text-right tabular-nums">
//                     {totals.morningTotalKg.toFixed(2)}
//                   </td>
//                   <td className="py-2.5 px-3 text-right tabular-nums">
//                     {totals.morningAvgFat.toFixed(2)}
//                   </td>
//                   <td className="py-2.5 px-3 text-right tabular-nums border-r border-slate-200">
//                     {totals.morningAvgSnf.toFixed(2)}
//                   </td>

//                   {/* Evening Totals */}
//                   <td className="py-2.5 px-3 text-right tabular-nums">
//                     {totals.eveningTotalKg.toFixed(2)}
//                   </td>
//                   <td className="py-2.5 px-3 text-right tabular-nums">
//                     {totals.eveningAvgFat.toFixed(2)}
//                   </td>
//                   <td className="py-2.5 px-3 text-right tabular-nums border-r border-slate-200">
//                     {totals.eveningAvgSnf.toFixed(2)}
//                   </td>

//                   {/* Combined Totals */}
//                   <td className="py-2.5 px-3 text-right tabular-nums text-emerald-700">
//                     {totals.combinedTotalKg.toFixed(2)}
//                   </td>
//                   <td className="py-2.5 px-3 text-right tabular-nums">
//                     {totals.combinedAvgFat.toFixed(2)}
//                   </td>
//                   <td className="py-2.5 px-3 text-right tabular-nums">
//                     {totals.combinedAvgSnf.toFixed(2)}
//                   </td>
//                 </tr>
//               </tfoot>
//             )}
//           </table>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default PeriodicReport

import React, { useState, useEffect, useMemo } from 'react'
import { Search, FileSpreadsheet, FileDown, RefreshCw } from 'lucide-react'
import { toast } from 'react-toastify'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import CustomForm from '@renderer/components/customform/CustomForm'
import Button1 from '@renderer/components/buttons/Button1'
import { useAuth } from '@renderer/context/AuthContext'
import { PeriodicReportDto } from '@shared/dtos/reports/periodic-report.dto'

export const PeriodicReport: React.FC = () => {
  const { user } = useAuth()

  const getCurrentDateISO = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDisplayDate = (dStr: string): string => {
    if (!dStr) return ''
    const parts = dStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`
    }
    return dStr
  }

  const [fromDate, setFromDate] = useState<string>(getCurrentDateISO())
  const [toDate, setToDate] = useState<string>(getCurrentDateISO())

  const [reportData, setReportData] = useState<PeriodicReportDto[]>([])
  const [loading, setLoading] = useState<boolean>(false)


  // Prevent fromDate from being greater than toDate
  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFrom = e.target.value
    if (toDate && selectedFrom > toDate) {
      toast.warn('From Date cannot be greater than To Date.')
      setFromDate(selectedFrom)
      setToDate(selectedFrom) // Automatically syncs toDate so it stays valid
    } else {
      setFromDate(selectedFrom)
    }
  }
  // Prevent toDate from being earlier than fromDate
  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTo = e.target.value
    if (fromDate && selectedTo < fromDate) {
      toast.warn('To Date cannot be earlier than From Date.')
      return
    }
    setToDate(selectedTo)
  }

  const fetchReport = async (start = fromDate, end = toDate): Promise<void> => {
    if (!start || !end) {
      toast.warn('Please select both From Date and To Date.')
      return
    }
    // Validation Guard
    if (start > end) {
      toast.warn('From Date cannot be greater than To Date.')
      return
    }

    try {
      setLoading(true)
      if (typeof window !== 'undefined' && (window.api as any)?.getPeriodicReport) {
        const response = await (window.api as any).getPeriodicReport(start, end)
        const list = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : []
        setReportData(list)
      } else {
        toast.error('getPeriodicReport API is not available on window.api.')
      }
    } catch (error: any) {
      console.error('Failed to load periodic report:', error)
      toast.error(error?.message || 'Failed to load periodic report.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport(getCurrentDateISO(), getCurrentDateISO())
  }, [])

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    fetchReport(fromDate, toDate)
  }

  // Calculate dynamic summary totals & weighted averages
  const totals = useMemo(() => {
    let morningTotalKg = 0
    let morningProductFat = 0
    let morningProductSnf = 0

    let eveningTotalKg = 0
    let eveningProductFat = 0
    let eveningProductSnf = 0

    let combinedTotalKg = 0
    let combinedProductFat = 0
    let combinedProductSnf = 0

    reportData.forEach((item) => {
      const mKg = Number(item.morning?.Total_KG) || 0
      const mFat = Number(item.morning?.fatavg) || 0
      const mSnf = Number(item.morning?.snfAvg) || 0

      const eKg = Number(item.evening?.Total_KG) || 0
      const eFat = Number(item.evening?.fatavg) || 0
      const eSnf = Number(item.evening?.snfAvg) || 0

      morningTotalKg += mKg
      morningProductFat += mKg * mFat
      morningProductSnf += mKg * mSnf

      eveningTotalKg += eKg
      eveningProductFat += eKg * eFat
      eveningProductSnf += eKg * eSnf

      const rowTotalKg = mKg + eKg
      combinedTotalKg += rowTotalKg
      combinedProductFat += mKg * mFat + eKg * eFat
      combinedProductSnf += mKg * mSnf + eKg * eSnf
    })

    const morningAvgFat = morningTotalKg > 0 ? morningProductFat / morningTotalKg : 0
    const morningAvgSnf = morningTotalKg > 0 ? morningProductSnf / morningTotalKg : 0

    const eveningAvgFat = eveningTotalKg > 0 ? eveningProductFat / eveningTotalKg : 0
    const eveningAvgSnf = eveningTotalKg > 0 ? eveningProductSnf / eveningTotalKg : 0

    const combinedAvgFat = combinedTotalKg > 0 ? combinedProductFat / combinedTotalKg : 0
    const combinedAvgSnf = combinedTotalKg > 0 ? combinedProductSnf / combinedTotalKg : 0

    return {
      morningTotalKg,
      morningAvgFat,
      morningAvgSnf,
      eveningTotalKg,
      eveningAvgFat,
      eveningAvgSnf,
      combinedTotalKg,
      combinedAvgFat,
      combinedAvgSnf
    }
  }, [reportData])

  // Download as Excel (.xls) file: ONLY exports the table element
  const handleDownloadExcel = () => {
    if (reportData.length === 0) {
      toast.warn('No data available to export.')
      return
    }

    const tableElement = document.getElementById('periodic-report-table')
    if (!tableElement) return

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 10px; font-family: Arial, sans-serif; font-size: 11px; }
          th { background-color: #f1f5f9; font-weight: bold; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
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
    link.download = `Periodic_Report_${fromDate}_to_${toDate}.xls`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Excel report export successfully!')
  }

  // Download PDF Handler - Uses jsPDF to prompt local "Save As" file path with top letterhead
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

    const plantId = user?.plant || '1215'
    const plantName = user?.plantName || 'Olarabindha, Balianta'

    // 1. Draw Top Letterhead (Matching the reference photo)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('PRAGATI MILK PRODUCTS PRIVATE LIMITED', 105, 12, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.text(`CHILLING CENTER - ${plantId},${plantName}`, 105, 17, { align: 'center' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.text('PERIODIC REPORT', 105, 22, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.text(`${formatDisplayDate(fromDate)}<--->${formatDisplayDate(toDate)}`, 105, 27, {
      align: 'center'
    })

    // 2. Multi-tier Header Definition with strict typing (as const)
    const head = [
      [
        {
          content: 'Route',
          rowSpan: 2,
          styles: { valign: 'middle' as const, halign: 'left' as const }
        },
        { content: 'Morning', colSpan: 3, styles: { halign: 'left' as const } },
        { content: 'Evening', colSpan: 3, styles: { halign: 'left' as const } },
        { content: 'Total', colSpan: 3, styles: { halign: 'left' as const } }
      ],
      ['KG', 'FAT(avg)', 'SNF(avg)', 'KG', 'FAT(avg)', 'SNF(avg)', 'KG', 'FAT(avg)', 'SNF(avg)']
    ]

    // 3. Table Rows
    const body = reportData.map((item) => {
      const mKg = Number(item.morning?.Total_KG) || 0
      const mFat = Number(item.morning?.fatavg) || 0
      const mSnf = Number(item.morning?.snfAvg) || 0

      const eKg = Number(item.evening?.Total_KG) || 0
      const eFat = Number(item.evening?.fatavg) || 0
      const eSnf = Number(item.evening?.snfAvg) || 0

      const rowTotalKg = mKg + eKg
      const rowTotalFat = rowTotalKg > 0 ? (mKg * mFat + eKg * eFat) / rowTotalKg : 0
      const rowTotalSnf = rowTotalKg > 0 ? (mKg * mSnf + eKg * eSnf) / rowTotalKg : 0

      return [
        item.route_name || item.route_code || '',
        mKg.toFixed(2),
        mFat.toFixed(2),
        mSnf.toFixed(2),
        eKg.toFixed(2),
        eFat.toFixed(2),
        eSnf.toFixed(2),
        rowTotalKg.toFixed(2),
        rowTotalFat.toFixed(2),
        rowTotalSnf.toFixed(2)
      ]
    })

    // 4. Footer Totals Row
    const foot = [
      [
        'Total',
        totals.morningTotalKg.toFixed(2),
        totals.morningAvgFat.toFixed(2),
        totals.morningAvgSnf.toFixed(2),
        totals.eveningTotalKg.toFixed(2),
        totals.eveningAvgFat.toFixed(2),
        totals.eveningAvgSnf.toFixed(2),
        totals.combinedTotalKg.toFixed(2),
        totals.combinedAvgFat.toFixed(2),
        totals.combinedAvgSnf.toFixed(2)
      ]
    ]

    // 5. Generate Table
    autoTable(doc, {
      startY: 31,
      head: head,
      body: body,
      foot: foot,
      theme: 'plain',
      styles: {
        fontSize: 8,
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
        0: { halign: 'left' as const, cellWidth: 32 },
        1: { halign: 'right' as const },
        2: { halign: 'right' as const },
        3: { halign: 'right' as const },
        4: { halign: 'right' as const },
        5: { halign: 'right' as const },
        6: { halign: 'right' as const },
        7: { halign: 'right' as const },
        8: { halign: 'right' as const },
        9: { halign: 'right' as const }
      },
      margin: { left: 8, right: 8, top: 10, bottom: 8 }
    })

    // Triggers native download, opening local folder save dialog
    doc.save(`Periodic_Report_${fromDate}_to_${toDate}.pdf`)
    toast.success('PDF export successfully!')
  }

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageBreadcrumb title="Periodic Report" />

        {/* Action Buttons: Print button removed, Download PDF opens Save Dialog */}
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

      <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-3">
        {/* Filter Form */}
        <CustomForm onSubmit={handleSearch} className="w-full">
          <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-3">
            {/* From Date */}
            <div className=" space-y-1">
              <label className="text-xs font-semibold text-slate-700">From Date</label>
              <CustomForm.CustomDateField
                name="fromDate"
                value={fromDate}
                max={toDate}
                onChange={handleFromDateChange}
              />
            </div>

            {/* To Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">To Date</label>
              <CustomForm.CustomDateField
                name="toDate"
                value={toDate}
                min={fromDate}
                onChange={handleToDateChange}
              />
            </div>

            {/* Search Button */}
            <div className="flex items-end pt-2 sm:pt-0">
              <Button1
                variant="primary"
                type="submit"
                disabled={loading}
                icon={
                  loading ? (
                    <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5 text-white" />
                  )
                }
                label={loading ? 'Searching...' : 'Search'}
              />
            </div>
          </div>
        </CustomForm>

        {/* Summary Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">Route-wise Periodic Summary</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              {formatDisplayDate(fromDate)} &mdash; {formatDisplayDate(toDate)}
            </span>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total Routes: <strong className="text-slate-800">{reportData.length}</strong>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table id="periodic-report-table" className="w-full text-left border-collapse">
            <thead>
              {/* Tier 1 Header */}
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th
                  rowSpan={2}
                  className="py-2.5 px-3 whitespace-nowrap border-r border-slate-200 align-middle"
                >
                  <span className="font-bold">Route</span>
                </th>
                <th
                  colSpan={3}
                  className="py-2 px-3 text-center border-r border-slate-200 bg-blue-50/50 text-blue-900"
                >
                  Morning
                </th>
                <th
                  colSpan={3}
                  className="py-2 px-3 text-center border-r border-slate-200 bg-amber-50/50 text-amber-900"
                >
                  Evening
                </th>
                <th colSpan={3} className="py-2 px-3 text-center bg-emerald-50/50 text-emerald-900">
                  Total
                </th>
              </tr>

              {/* Tier 2 Header */}
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                {/* Morning */}
                <th className="py-2 px-3 text-right">KG</th>
                <th className="py-2 px-3 text-right">FAT(avg)</th>
                <th className="py-2 px-3 text-right border-r border-slate-200">SNF(avg)</th>

                {/* Evening */}
                <th className="py-2 px-3 text-right">KG</th>
                <th className="py-2 px-3 text-right">FAT(avg)</th>
                <th className="py-2 px-3 text-right border-r border-slate-200">SNF(avg)</th>

                {/* Total */}
                <th className="py-2 px-3 text-right">KG</th>
                <th className="py-2 px-3 text-right">FAT(avg)</th>
                <th className="py-2 px-3 text-right">SNF(avg)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                    Loading periodic report data...
                  </td>
                </tr>
              )}

              {!loading && reportData.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                    No periodic collection records found for the period{' '}
                    {formatDisplayDate(fromDate)} to {formatDisplayDate(toDate)}
                  </td>
                </tr>
              )}

              {!loading &&
                reportData.map((item, index) => {
                  const mKg = Number(item.morning?.Total_KG) || 0
                  const mFat = Number(item.morning?.fatavg) || 0
                  const mSnf = Number(item.morning?.snfAvg) || 0

                  const eKg = Number(item.evening?.Total_KG) || 0
                  const eFat = Number(item.evening?.fatavg) || 0
                  const eSnf = Number(item.evening?.snfAvg) || 0

                  const rowTotalKg = mKg + eKg
                  const rowTotalFat = rowTotalKg > 0 ? (mKg * mFat + eKg * eFat) / rowTotalKg : 0
                  const rowTotalSnf = rowTotalKg > 0 ? (mKg * mSnf + eKg * eSnf) / rowTotalKg : 0

                  return (
                    <tr key={item.route_code || index} className="hover:bg-slate-50/80 transition">
                      {/* Route Name */}
                      <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap border-r border-slate-100">
                        {item.route_name || item.route_code}
                      </td>

                      {/* Morning Metrics */}
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                        {mKg.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                        {mFat.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 border-r border-slate-100">
                        {mSnf.toFixed(2)}
                      </td>

                      {/* Evening Metrics */}
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                        {eKg.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                        {eFat.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 border-r border-slate-100">
                        {eSnf.toFixed(2)}
                      </td>

                      {/* Total Metrics */}
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900 bg-slate-50/30">
                        {rowTotalKg.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-800 bg-slate-50/30">
                        {rowTotalFat.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-800 bg-slate-50/30">
                        {rowTotalSnf.toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
            </tbody>

            {/* Total Footer Row */}
            {!loading && reportData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100/80 border-t-2 border-slate-300 font-bold text-xs text-slate-900">
                  <td className="py-2.5 px-3 border-r border-slate-200">Total</td>

                  {/* Morning Totals */}
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {totals.morningTotalKg.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {totals.morningAvgFat.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums border-r border-slate-200">
                    {totals.morningAvgSnf.toFixed(2)}
                  </td>

                  {/* Evening Totals */}
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {totals.eveningTotalKg.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {totals.eveningAvgFat.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums border-r border-slate-200">
                    {totals.eveningAvgSnf.toFixed(2)}
                  </td>

                  {/* Combined Totals */}
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-900">
                    {totals.combinedTotalKg.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {totals.combinedAvgFat.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {totals.combinedAvgSnf.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}

export default PeriodicReport
