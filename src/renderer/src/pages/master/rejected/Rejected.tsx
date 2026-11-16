// import React from 'react'

// export const Rejected: React.FC = () => {

//   return (
//     <div className="space-y-3">
//       Rejected List
//     </div>
//   )
// }

// export default Rejected

import React, { useEffect, useState } from 'react'
import { RefreshCw, UploadCloud, Search } from 'lucide-react'
import { toast } from 'react-toastify'
import CustomForm from '@renderer/components/customform/CustomForm'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import Button1 from '@renderer/components/buttons/Button1'
import TableToolbar from '@renderer/components/table/TableToolbar'
import TablePagination from '@renderer/components/table/TablePagination'
import { useAuth } from '@renderer/context/AuthContext'
import type { MilkRejectionResponseDto } from '@shared/dtos/milk-rejection/milk-rejection.dto'

export const Rejected: React.FC = () => {
  const { user } = useAuth()

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

  // Date Filter states (default: today's date)
  const [fromDate, setFromDate] = useState<string>(getCurrentLocalDate())
  const [toDate, setToDate] = useState<string>(getCurrentLocalDate())

  // Applied date filters (locked until user clicks Submit)
  const [appliedFromDate, setAppliedFromDate] = useState<string>(getCurrentLocalDate())
  const [appliedToDate, setAppliedToDate] = useState<string>(getCurrentLocalDate())

  const [showConfirm, setShowConfirm] = useState(false)
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

  // Fetch paginated rejections with applied date filters
  const fetchPaginatedRejections = async (
    pageNo = pagination.page,
    limitVal = pageSize,
    searchVal = searchQuery,
    fDate = appliedFromDate,
    tDate = appliedToDate
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
        fDate,
        tDate
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
    if (fromDate && toDate && fromDate > toDate) {
      toast.warn('From Date cannot be greater than To Date.')
      return
    }
    setAppliedFromDate(fromDate)
    setAppliedToDate(toDate)
    fetchPaginatedRejections(1, pageSize, searchQuery, fromDate, toDate)
  }

  // Initial load on mount & debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPaginatedRejections(1, pageSize, searchQuery, appliedFromDate, appliedToDate)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, pageSize])

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb title="Rejected Collections" />

        <Button1
          onClick={() => setShowConfirm(true)}
          variant="primary"
          icon={<UploadCloud className="w-3.5 h-3.5 text-white" />}
          label="Sync to server"
        />

        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in rounded-2xl">
            <div className="w-full max-w-md bg-white shadow-2xl border rounded-2xl border-slate-100 p-6 text-center transform transition-all scale-100">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                <RefreshCw className="w-8 h-8 animate-spin-slow" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Sync to Server</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                This will upload rejected milk collection records from{' '}
                <strong className="text-slate-800">{formatDateForDisplay(appliedFromDate)}</strong>{' '}
                to <strong className="text-slate-800">{formatDateForDisplay(appliedToDate)}</strong>{' '}
                to the central cloud server. Are you sure you want to proceed?
              </p>

              {/* Current Context Badges */}
              <div className="mb-6 py-2 px-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex flex-wrap justify-center gap-4">
                <span>
                  Plant:{' '}
                  <strong className="text-slate-800">
                    {user?.plantName || user?.plant || '1102'}
                  </strong>
                </span>
                <span>
                  User: <strong className="text-slate-800">{user?.userName || '-'}</strong>
                </span>
                <span>
                  Date Range:{' '}
                  <strong className="text-slate-800">
                    {formatDateForDisplay(appliedFromDate)} to {formatDateForDisplay(appliedToDate)}
                  </strong>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirm(false)
                    toast.info('Sync functionality will be configured in the next step.')
                  }}
                  className="w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  Yes, Sync to Server
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        {/* Date Filter Bar */}
        <CustomForm onSubmit={handleSubmitFilter} className="w-full">
          <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-3 mb-3 items-end">
            {/* From Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">From Date</label>
              <CustomForm.CustomDateField
                name="fromDate"
                value={fromDate}
                onChange={(e: any) => setFromDate(e.target.value)}
              />
            </div>

            {/* To Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">To Date</label>
              <CustomForm.CustomDateField
                name="toDate"
                value={toDate}
                onChange={(e: any) => setToDate(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-end justify-start">
              <Button1
                variant="primary"
                icon={<Search className="w-3.5 h-3.5 text-white" />}
                label={loading ? 'Filtering...' : 'Submit'}
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

        {/* Table Following Rejection.tsx Columns */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-2 whitespace-nowrap">ID</th>
                <th className="py-3 px-2 whitespace-nowrap">Date</th>
                <th className="py-3 px-2 whitespace-nowrap">Shift</th>
                <th className="py-3 px-2 whitespace-nowrap">Plant</th>
                <th className="py-3 px-2 whitespace-nowrap">Route Name</th>
                <th className="py-3 px-2 whitespace-nowrap">DSK Code</th>
                <th className="py-3 px-2 whitespace-nowrap">DSK Name</th>
                <th className="py-3 px-2 whitespace-nowrap">Supervisor</th>
                <th className="py-3 px-2 whitespace-nowrap">No. of Cans</th>
                <th className="py-3 px-2 whitespace-nowrap">Approx Qty (LTR)</th>
                <th className="py-3 px-2 whitespace-nowrap">Reason</th>
                <th className="py-3 px-2 whitespace-nowrap text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && (
                <tr>
                  <td colSpan={11} className="py-4 text-center text-slate-400 font-medium">
                    Loading rejections...
                  </td>
                </tr>
              )}
              {!loading && rejections.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-4 text-center text-slate-400 font-medium">
                    No milk rejections found for the selected date range
                  </td>
                </tr>
              )}
              {!loading &&
                rejections.map((item, index) => (
                  <tr key={item.id ?? index} className="hover:bg-slate-50/70 transition">
                    <td className="py-2 px-2 font-semibold text-primary">{item.id}</td>
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
                    <td className="py-2 px-2 font-semibold text-primary">{item.shift}</td>
                    <td className="py-2 px-2 font-semibold text-slate-800">{item.plant}</td>
                    <td className="py-2 px-2 font-semibold text-primary">{item.routeName}</td>
                    <td className="py-2 px-2 text-slate-700">{item.dskCode}</td>
                    <td className="py-2 px-2 font-semibold text-slate-800">{item.dskName}</td>
                    <td className="py-2 px-2 text-slate-700">{item.supervisor}</td>

                    <td className="py-2 px-2 text-slate-700">{item.noOfCanes}</td>
                    <td className="py-2 px-2 font-bold text-emerald-600">{item.aproxQuantity}</td>
                    <td className="py-2 px-2 text-slate-700">{item.reason}</td>
                    <td className="py-2 px-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          item.syncStatus === 'synced' || item.syncStatus === '1'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {item.syncStatus === 'synced' || item.syncStatus === '1'
                          ? 'Synced'
                          : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
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
            fetchPaginatedRejections(newPage, pageSize, searchQuery, appliedFromDate, appliedToDate)
          }
        />
      </div>
    </div>
  )
}

export default Rejected
