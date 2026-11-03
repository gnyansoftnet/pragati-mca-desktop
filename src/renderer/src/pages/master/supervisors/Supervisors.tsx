import React, { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import Button1 from '@renderer/components/buttons/Button1'
import TableToolbar from '@renderer/components/table/TableToolbar'
import TablePagination from '@renderer/components/table/TablePagination'
import api from '@renderer/services'
import type { Supervisor } from '@renderer/types/supervisors/supervisors.types'

interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export const Supervisors: React.FC = () => {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [loadingSupervisors, setLoadingSupervisors] = useState<boolean>(false)

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

  // Fetch paginated supervisors
  const fetchPaginatedSupervisors = async (
    pageNo: number = pagination.page,
    limitVal: number | 'all' = pageSize,
    searchVal: string = searchQuery
  ) => {
    try {
      setLoadingSupervisors(true)

      const actualLimit = limitVal === 'all' ? 100000000000000 : limitVal

      let response: any = null
      if ((api as any)?.supervisors?.getPaginated) {
        response = await (api as any).supervisors.getPaginated(
          pageNo,
          actualLimit,
          searchVal.trim()
        )
      } else if (typeof window !== 'undefined' && (window as any).api?.getPaginatedSupervisors) {
        response = await (window as any).api.getPaginatedSupervisors({
          page: pageNo,
          limit: actualLimit,
          search: searchVal.trim()
        })
      }

      if (response) {
        const dataList = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : []
        setSupervisors(dataList)

        if (response.pagination) {
          setPagination(response.pagination)
        } else if ('totalPages' in response) {
          setPagination({
            page: response.page || pageNo,
            limit: actualLimit,
            total: response.total || dataList.length,
            totalPages: response.totalPages || 1,
            hasNextPage: response.hasNextPage ?? pageNo < (response.totalPages || 1),
            hasPrevPage: response.hasPrevPage ?? pageNo > 1
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch supervisors:', error)
    } finally {
      setLoadingSupervisors(false)
    }
  }

  // Debounced search & entries-per-page change effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPaginatedSupervisors(1, pageSize, searchQuery)
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
    fetchPaginatedSupervisors(newPage, pageSize, searchQuery)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb title="Supervisors" desc="Manage and view plant supervisors" />

        <div className="flex items-center gap-2.5">
          <Button1
            variant="primary"
            icon={<RefreshCw className="w-3.5 h-3.5 text-white" />}
            label="Sync Supervisor Data"
          />
        </div>
      </div>

      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        {/* Reusable Top Toolbar */}
        <TableToolbar
          pageSize={pageSize}
          onPageSizeChange={handleLimitChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search supervisor by name, ID, or plant..."
        />

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-2">ID</th>
                <th className="py-3 px-2">Employee ID</th>
                <th className="py-3 px-2">Supervisor Name</th>
                <th className="py-3 px-2">Plant</th>
                <th className="py-3 px-2">Contact No</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loadingSupervisors && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    Loading supervisors...
                  </td>
                </tr>
              )}
              {supervisors.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    No supervisors found
                  </td>
                </tr>
              )}
              {supervisors.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-2 px-4 font-semibold text-primary">{item.id}</td>
                  <td className="py-2 px-4 font-semibold text-primary">{item.empId}</td>
                  <td className="py-2 px-4 font-semibold text-slate-800">
                    {`${item.firstName} ${item.lastName}`}
                  </td>
                  <td className="py-2 px-4 font-semibold text-primary">{item.plant}</td>
                  <td className="py-2 px-4 text-slate-600">{item.contactNo || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Reusable Pagination Footer */}
        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pageSize}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          loading={loadingSupervisors}
          itemName="supervisors"
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}

export default Supervisors
