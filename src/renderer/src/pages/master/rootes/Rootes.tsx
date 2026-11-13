import React, { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'react-toastify'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import Button1 from '@renderer/components/buttons/Button1'
import TableToolbar from '@renderer/components/table/TableToolbar'
import TablePagination from '@renderer/components/table/TablePagination'
import api from '@renderer/services'
// import type { Route } from '@renderer/types/routes/routes.types'
import { useAuth } from '@renderer/context/AuthContext'
import { useNetwork } from '@renderer/hooks/useNetwork'
import { RouteResponseDto } from '@shared/dtos/route/route-response.dto'

export const Rootes: React.FC = () => {
  const { user } = useAuth()
  const { verifyConnection } = useNetwork()

  const [showConfirm, setShowConfirm] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [routes, setRoutes] = useState<RouteResponseDto[]>([])
  const [loadingRoutes, setLoadingRoutes] = useState<boolean>(false)

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

  const fetchPaginatedRoutes = async (
    pageNo = pagination.page,
    limitVal = pageSize,
    searchVal = searchQuery
  ) => {
    try {
      setLoadingRoutes(true)
      const actualLimit = limitVal === 'all' ? 10000000000000 : limitVal
      const response = await api.routes.getPaginated(pageNo, actualLimit, searchVal.trim())

      if (response) {
        const dataList = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : []
        setRoutes(dataList)

        if (response.pagination) {
          setPagination(response.pagination)
        }
      }
    } catch (error) {
      console.error('Failed to fetch routes:', error)
    } finally {
      setLoadingRoutes(false)
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
      const result = await (window as any).api?.syncRoutes(plant, org, branch)
      if (result && (result.success === 1 || result.success === true)) {
        toast.success(result.message || 'Routes synced successfully from server!')
        // Refresh routes table to display newly synced data
        await fetchPaginatedRoutes(1, pageSize, searchQuery)
      } else {
        toast.error(result?.message || 'Failed to sync routes from server.')
      }
    } catch (error: any) {
      console.error('Failed to sync routes:', error)
      toast.error(error?.message || 'An error occurred while syncing routes.')
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPaginatedRoutes(1, pageSize, searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, pageSize])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb title="Routes" desc="Sync routes with internet connection" />
        <Button1
          disabled={isSyncing}
          onClick={() => setShowConfirm(true)}
          variant="primary"
          icon={
            <RefreshCw className={`w-3.5 h-3.5 text-white ${isSyncing ? 'animate-spin' : ''}`} />
          }
          label={isSyncing ? 'Syncing...' : 'Sync Route Data'}
        />
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 text-center transform transition-all scale-100">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
                <RefreshCw className="w-8 h-8 animate-spin-slow" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Sync Route Data
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                It will take a while, are you sure you want to continue?
              </p>
              {/* Displaying Current User Context */}
              <div className="mb-6 py-2 px-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex justify-center gap-4">
                <span>
                  Plant:{' '}
                  <strong className="text-slate-800">
                    {user?.plant}
                  </strong>
                </span>
                <span>
                  User:{' '}
                  <strong className="text-slate-800">
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
                  className="w-1/2 py-2.5 px-4 rounded-xl border border-slate-200  text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
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
        <TableToolbar
          pageSize={pageSize}
          onPageSizeChange={(val) => setPageSize(val === 'all' ? 'all' : Number(val))}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search route code or name..."
        />

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-2">ID</th>
                <th className="py-3 px-2">Route Code</th>
                <th className="py-3 px-2">Route Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loadingRoutes && (
                <tr>
                  <td colSpan={3}>Loading Routes....</td>
                </tr>
              )}
              {routes.length === 0 && (
                <tr>
                  <td colSpan={3}>No Routes Found </td>
                </tr>
              )}
              {routes.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-2 px-4 font-semibold text-primary">{item.id}</td>
                  <td className="py-2 px-4 font-semibold text-primary">{item.routeCode}</td>
                  <td className="py-2 px-4 font-semibold text-primary">{item.routeName}</td>
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
          loading={loadingRoutes}
          itemName="routes"
          onPageChange={(newPage) => fetchPaginatedRoutes(newPage, pageSize, searchQuery)}
        />
      </div>
    </div>
  )
}

export default Rootes
