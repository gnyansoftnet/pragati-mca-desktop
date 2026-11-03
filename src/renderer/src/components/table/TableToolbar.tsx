import React from 'react'
import { Search } from 'lucide-react'

export interface TableToolbarProps {
  pageSize: number | 'all'
  onPageSizeChange: (newLimit: string) => void
  searchQuery: string
  onSearchChange: (newQuery: string) => void
  searchPlaceholder?: string
  pageSizeOptions?: (number | 'all')[]
  className?: string
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  pageSize,
  onPageSizeChange,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search in table...',
  pageSizeOptions = [10, 20, 30, 'all'],
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 ${className}`}
    >
      {/* Show Entries Dropdown */}
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <span>Show</span>
        <select
          value={String(pageSize)}
          onChange={(e) => onPageSizeChange(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-primary cursor-pointer transition"
        >
          {pageSizeOptions.map((opt) => (
            <option key={String(opt)} value={String(opt)}>
              {opt === 'all' ? 'All' : opt}
            </option>
          ))}
        </select>
        <span>entries</span>
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-64">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition"
        />
      </div>
    </div>
  )
}

export default TableToolbar
