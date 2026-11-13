import React, { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'react-toastify'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import Button1 from '@renderer/components/buttons/Button1'
import TableToolbar from '@renderer/components/table/TableToolbar'
import TablePagination from '@renderer/components/table/TablePagination'
import api from '@renderer/services'
// import type { Vendor } from '@renderer/types/vendors/vendors.types'
import { useAuth } from '@renderer/context/AuthContext'
import { useNetwork } from '@renderer/hooks/useNetwork'
import { VendoreResponseDto } from '@shared/dtos/vendor/vendor.dto'

interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export const Vendors: React.FC = () => {
  const { user } = useAuth()
  const { verifyConnection } = useNetwork()

  const [showConfirm, setShowConfirm] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [vendors, setVendors] = useState<VendoreResponseDto[]>([])
  const [loadingVendors, setLoadingVendors] = useState<boolean>(false)

  // Filter & Pagination States
  const [pageSize, setPageSize] = useState<number | 'all'>(10)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Fetch paginated vendors using api.vendors.getPaginated
  const fetchPaginatedVendors = async (
    pageNo: number = pagination.page,
    limitVal: number | 'all' = pageSize,
    searchVal: string = searchQuery
  ) => {
    try {
      setLoadingVendors(true)

      // When "all" is selected, send a high limit like 10000
      const actualLimit = limitVal === 'all' ? 100000000000000 : limitVal

      const response = await api.vendors.getPaginated(pageNo, actualLimit, searchVal.trim())

      if (response) {
        // Support both { data: [...] } and direct array response
        const dataList = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : []
        setVendors(dataList)

        // Update pagination metadata
        if (response.pagination) {
          setPagination(response.pagination)
        } else if ('totalPages' in (response as any)) {
          const respAny = response as any
          setPagination({
            page: respAny.page || pageNo,
            limit: actualLimit,
            total: respAny.total || dataList.length,
            totalPages: respAny.totalPages || 1,
            hasNextPage: respAny.hasNextPage ?? pageNo < (respAny.totalPages || 1),
            hasPrevPage: respAny.hasPrevPage ?? pageNo > 1
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch paginated vendors:', error)
    } finally {
      setLoadingVendors(false)
    }
  }

  const handleStartSync = async () => {
    // Check internet connection first
    const hasNet = await verifyConnection()
    if (!hasNet) {
      toast.error('Cannot sync routes: No internet connection! Please check your network.')
      setShowConfirm(false)
      return
    }
    // Extract logged-in user credentials (with safe fallbacks)
    const plant = String(user?.plant)
    const org = String(user?.orgCode)
    const branch = String(user?.branchCode)
    // console.log('plant', user?.plant)
    // console.log('org', user?.orgCode)
    // console.log('branch', user?.branchCode)
    try {
      setIsSyncing(true)
      setShowConfirm(false)
      const result = await (window as any).api?.syncVendors(plant, org, branch)
      if (result && (result.success === 1 || result.success === true)) {
        toast.success(result.message || 'Vendors synced successfully from server!')
        // Refresh routes table to display newly synced data
        await fetchPaginatedVendors(1, pageSize, searchQuery)
      } else {
        toast.error(result?.message || 'Failed to sync vendors from server.')
      }
    } catch (error: any) {
      console.error('Failed to sync vendors:', error)
      toast.error(error?.message || 'An error occurred while syncing vendors.')
    } finally {
      setIsSyncing(false)
    }
  }

  // Debounced search & limit change effect (resets to page 1)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPaginatedVendors(1, pageSize, searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, pageSize])

  // Handle Entries Per Page Dropdown Change
  const handleLimitChange = (val: string) => {
    const newLimit = val === 'all' ? 'all' : Number(val)
    setPageSize(newLimit)
  }

  // Handle Next / Previous Page Navigation
  const handlePageChange = (newPage: number) => {
    fetchPaginatedVendors(newPage, pageSize, searchQuery)
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb title="Vendors" desc="Sync vendors with internet connection" />

        <Button1
          disabled={isSyncing}
          onClick={() => setShowConfirm(true)}
          variant="primary"
          icon={
            <RefreshCw className={`w-3.5 h-3.5 text-white ${isSyncing ? 'animate-spin' : ''}`} />
          }
          label={isSyncing ? 'Syncing...' : 'Sync Vendor Data'}
        />
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-zinc-800 p-6 text-center transform transition-all scale-100">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
                <RefreshCw className="w-8 h-8 animate-spin-slow" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 mb-2">
                Sync Vendor Data
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed mb-4">
                It will take a while, are you sure you want to continue?
              </p>
              {/* Displaying Current User Context */}
              <div className="mb-6 py-2 px-3 bg-slate-50 dark:bg-zinc-800 rounded-xl text-xs text-slate-600 dark:text-zinc-400 flex justify-center gap-4">
                <span>
                  Plant:{' '}
                  <strong className="text-slate-800 dark:text-zinc-200">
                    {user?.plant}
                  </strong>
                </span>
                <span>
                  User:{' '}
                  <strong className="text-slate-800 dark:text-zinc-200">
                    {user?.userName}
                  </strong>
                </span>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => setShowConfirm(false)}
                  className="w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleStartSync}
                  className="w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSyncing ? 'Syncing...' : 'Yes, Start Sync'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        {/* Top Toolbar */}
        <TableToolbar
          pageSize={pageSize}
          onPageSizeChange={handleLimitChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search vendor code or name..."
        />

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">DSK Code</th>
                <th className="py-3 px-3">DSK Name</th>
                <th className="py-3 px-3">Vendor Code</th>
                <th className="py-3 px-3">Mobile No</th>
                <th className="py-3 px-3">Route Code</th>
                <th className="py-3 px-3">Supervisor EmpId</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loadingVendors && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                    Loading vendors...
                  </td>
                </tr>
              )}
              {vendors.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                    No vendors found
                  </td>
                </tr>
              )}
              {vendors.map((item) => (
                <tr key={item.id} className="hover:bg-secondary/5 transition">
                  <td className="py-2 px-4 font-semibold text-primary">{item.id}</td>
                  <td className="py-2 px-4 font-semibold text-primary">{item.dskCode}</td>
                  <td className="py-2 px-4 font-semibold text-primary">{item.dskName}</td>
                  <td className="py-2 px-4 font-semibold text-primary">{item.vendorCode}</td>
                  <td className="py-2 px-4 font-semibold text-primary">{item.mobileNumber}</td>
                  <td className="py-2 px-4 font-semibold text-primary">{item.routeCode}</td>
                  <td className="py-2 px-4 font-semibold text-primary">{item.supervisorEmpId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pageSize}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          loading={loadingVendors}
          itemName="vendors"
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}

export default Vendors
