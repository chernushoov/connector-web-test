'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAdminUI } from '@/store/admin'
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// Column definition
export interface Column<T> {
  id: string
  header: string
  headerRu?: string
  accessor?: keyof T | ((row: T) => React.ReactNode)
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  cell?: (row: T) => React.ReactNode
}

// Row action
export interface RowAction<T> {
  id: string
  label: string
  labelRu?: string
  icon: React.ReactNode
  onClick: (row: T) => void
  variant?: 'default' | 'danger'
  show?: (row: T) => boolean
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  actions?: RowAction<T>[]
  // Selection
  selectable?: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  getRowId: (row: T) => string
  // Sorting
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  // Pagination
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
  // Loading
  isLoading?: boolean
  // Empty state
  emptyMessage?: string
  emptyMessageRu?: string
  // Bulk actions
  bulkActions?: React.ReactNode
  // Other
  className?: string
  stickyHeader?: boolean
}

export function DataTable<T>({
  data,
  columns,
  actions,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  getRowId,
  sortColumn,
  sortDirection,
  onSort,
  page = 1,
  pageSize = 20,
  total,
  onPageChange,
  isLoading = false,
  emptyMessage = 'No data found',
  emptyMessageRu = 'Данные не найдены',
  bulkActions,
  className,
  stickyHeader = true,
}: DataTableProps<T>) {
  const { language } = useAdminUI()
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null)

  const allSelected =
    data.length > 0 && data.every((row) => selectedIds.includes(getRowId(row)))
  const someSelected = selectedIds.length > 0 && !allSelected

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange?.([])
    } else {
      onSelectionChange?.(data.map(getRowId))
    }
  }

  const toggleRow = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(selectedIds.filter((i) => i !== id))
    } else {
      onSelectionChange?.([...selectedIds, id])
    }
  }

  const handleSort = (columnId: string) => {
    if (!onSort) return

    if (sortColumn === columnId) {
      onSort(columnId, sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      onSort(columnId, 'asc')
    }
  }

  const getCellValue = (row: T, column: Column<T>) => {
    if (column.cell) return column.cell(row)

    const accessor = column.accessor
    if (!accessor) return null
    if (typeof accessor === 'function') return accessor(row)

    return row[accessor] as React.ReactNode
  }

  const totalPages = total ? Math.ceil(total / pageSize) : 1

  return (
    <div
      className={cn('bg-white rounded-xl shadow-sm overflow-hidden', className)}
    >
      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && bulkActions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-brand-primary/5 border-b border-brand-primary/20 px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-brand-primary font-medium">
                {selectedIds.length}{' '}
                {language === 'ru' ? 'выбрано' : 'selected'}
              </span>
              {bulkActions}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            className={cn(
              'bg-neutral-50 border-b border-neutral-200',
              stickyHeader && 'sticky top-0 z-10'
            )}
          >
            <tr>
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected
                    }}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-neutral-300 text-brand-primary focus:ring-brand-primary"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    'px-4 py-3 text-xs font-semibold uppercase tracking-wider',
                    'text-neutral-500 text-left',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer hover:text-neutral-900'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div
                    className={cn(
                      'flex items-center gap-1',
                      column.align === 'center' && 'justify-center',
                      column.align === 'right' && 'justify-end'
                    )}
                  >
                    <span>
                      {language === 'ru' && column.headerRu
                        ? column.headerRu
                        : column.header}
                    </span>
                    {column.sortable && sortColumn === column.id && (
                      <span>
                        {sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="w-12 px-4 py-3" />
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {selectable && (
                    <td className="px-4 py-4">
                      <div className="w-4 h-4 bg-neutral-200 rounded" />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.id} className="px-4 py-4">
                      <div className="h-4 bg-neutral-200 rounded w-3/4" />
                    </td>
                  ))}
                  {actions && <td className="px-4 py-4" />}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)
                  }
                  className="px-4 py-12 text-center text-neutral-500"
                >
                  {language === 'ru' ? emptyMessageRu : emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const rowId = getRowId(row)
                const isSelected = selectedIds.includes(rowId)

                return (
                  <tr
                    key={rowId}
                    className={cn(
                      'transition-colors',
                      isSelected ? 'bg-brand-primary/5' : 'hover:bg-neutral-50'
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(rowId)}
                          className="w-4 h-4 rounded border-neutral-300 text-brand-primary focus:ring-brand-primary"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          'px-4 py-4 text-sm',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {getCellValue(row, column)}
                      </td>
                    ))}
                    {actions && actions.length > 0 && (
                      <td className="px-4 py-4 relative">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenActionMenu(
                                openActionMenu === rowId ? null : rowId
                              )
                            }
                            className="p-1 rounded hover:bg-neutral-100 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                          </button>

                          <AnimatePresence>
                            {openActionMenu === rowId && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 min-w-[140px]"
                              >
                                {actions
                                  .filter((a) => !a.show || a.show(row))
                                  .map((action) => (
                                    <button
                                      key={action.id}
                                      onClick={() => {
                                        action.onClick(row)
                                        setOpenActionMenu(null)
                                      }}
                                      className={cn(
                                        'w-full flex items-center gap-2 px-3 py-2 text-sm',
                                        'transition-colors text-left',
                                        action.variant === 'danger'
                                          ? 'text-danger hover:bg-danger/5'
                                          : 'text-neutral-700 hover:bg-neutral-50'
                                      )}
                                    >
                                      {action.icon}
                                      <span>
                                        {language === 'ru' && action.labelRu
                                          ? action.labelRu
                                          : action.label}
                                      </span>
                                    </button>
                                  ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total !== undefined && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
          <span className="text-sm text-neutral-500">
            {language === 'ru'
              ? `Показано ${(page - 1) * pageSize + 1} - ${Math.min(
                  page * pageSize,
                  total
                )} из ${total}`
              : `Showing ${(page - 1) * pageSize + 1} to ${Math.min(
                  page * pageSize,
                  total
                )} of ${total}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-neutral-600 px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
