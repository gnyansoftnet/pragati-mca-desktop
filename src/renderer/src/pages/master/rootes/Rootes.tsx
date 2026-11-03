import React, { useEffect, useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import Button1 from '@renderer/components/buttons/Button1'
import TableToolbar from '@renderer/components/table/TableToolbar'
import TablePagination from '@renderer/components/table/TablePagination'
import api from '@renderer/services'
import type { Route } from '@renderer/types/routes/routes.types'

export const Rootes: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([])
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
          variant="primary"
          icon={<RefreshCw className="w-3.5 h-3.5 text-white" />}
          label="Sync Route Data"
        />
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
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Route Code</th>
                <th className="py-3.5 px-4">Route Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
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
