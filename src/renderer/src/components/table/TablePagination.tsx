import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface TablePaginationProps {
  page: number
  totalPages: number
  totalItems?: number
  pageSize?: number | 'all'
  hasNextPage?: boolean
  hasPrevPage?: boolean
  loading?: boolean
  itemName?: string // e.g. "routes", "records", "items"
  onPageChange: (newPage: number) => void
  className?: string
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  page,
  totalPages,
  totalItems,
  pageSize = 10,
  hasNextPage,
  hasPrevPage,
  loading = false,
  itemName = 'items',
  onPageChange,
  className = ''
}) => {
  const isAll = pageSize === 'all'
  const effectiveTotalPages = isAll ? 1 : Math.max(totalPages || 1, 1)
  const canGoPrev = !isAll && (hasPrevPage ?? page > 1) && !loading
  const canGoNext = !isAll && (hasNextPage ?? page < effectiveTotalPages) && !loading

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 ${className}`}
    >
      <div>
        Showing page <span className="font-semibold text-slate-700">{page}</span> of{' '}
        <span className="font-semibold text-slate-700">{effectiveTotalPages}</span>
        {totalItems !== undefined && (
          <>
            {' '}
            ({totalItems} total {itemName})
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={!canGoPrev}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>
        <button
          type="button"
          disabled={!canGoNext}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition flex items-center gap-1"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default TablePagination
