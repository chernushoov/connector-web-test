'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Search, Zap, Users, X } from 'lucide-react'
import type { DayFilter } from '@/types'

// ============================================
// SHIFT FILTERS PROPS
// ============================================

export interface ShiftFiltersState {
  day: DayFilter
  instantOnly: boolean
  teamsOnly: boolean
  search: string
}

export interface ShiftFiltersProps {
  filters: ShiftFiltersState
  onChange: (filters: ShiftFiltersState) => void
  className?: string
}

// ============================================
// DAY FILTER CHIPS
// ============================================

const DAY_OPTIONS: { value: DayFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'week', label: 'This Week' },
]

// ============================================
// SHIFT FILTERS COMPONENT
// ============================================

export function ShiftFilters({ filters, onChange, className }: ShiftFiltersProps) {
  const updateFilter = <K extends keyof ShiftFiltersState>(
    key: K,
    value: ShiftFiltersState[K]
  ) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          placeholder="Search shifts..."
          className={cn(
            'w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200',
            'bg-white text-neutral-900 text-sm placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:border-brand-primary focus:ring-brand-primary/20',
            'transition-all duration-200'
          )}
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => updateFilter('search', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Horizontal scrollable row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {/* Day chips */}
        {DAY_OPTIONS.map((option) => {
          const isActive = filters.day === option.value
          return (
            <motion.button
              key={option.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateFilter('day', option.value)}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium',
                'transition-all duration-200 border',
                isActive
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
              )}
            >
              {option.label}
            </motion.button>
          )
        })}

        {/* Divider */}
        <div className="w-px h-6 bg-neutral-200 flex-shrink-0" />

        {/* Instant toggle */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => updateFilter('instantOnly', !filters.instantOnly)}
          className={cn(
            'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
            'transition-all duration-200 border',
            filters.instantOnly
              ? 'bg-brand-primary text-white border-brand-primary'
              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
          )}
        >
          <Zap className="w-3.5 h-3.5" />
          Instant
        </motion.button>

        {/* Teams toggle */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => updateFilter('teamsOnly', !filters.teamsOnly)}
          className={cn(
            'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
            'transition-all duration-200 border',
            filters.teamsOnly
              ? 'bg-brand-primary text-white border-brand-primary'
              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
          )}
        >
          <Users className="w-3.5 h-3.5" />
          Teams
        </motion.button>
      </div>
    </div>
  )
}

export default ShiftFilters
