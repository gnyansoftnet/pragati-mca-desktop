import React, { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import Button1 from '@renderer/components/buttons/Button1'
import TableToolbar from '@renderer/components/table/TableToolbar'
import TablePagination from '@renderer/components/table/TablePagination'
import api from '@renderer/services'
import type { Vendor } from '@renderer/types/vendors/vendors.types'

interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export const Vendors: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([])
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

        <div className="flex items-center gap-2.5">
          <Button1
            variant="primary"
            icon={<RefreshCw className="w-3.5 h-3.5 text-white" />}
            label="Sync Vendor Data"
          />
        </div>
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
