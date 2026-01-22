'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useWorker, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { Button } from '@/components/ui/Button'
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react'
import type { DayFilter, FilterState } from '@/types'

interface FilterSheetProps {
  isOpen: boolean
  onClose: () => void
  onApply?: (filters: Partial<FilterState>) => void
}

export function FilterSheet({ isOpen, onClose, onApply }: FilterSheetProps) {
  const { language, isRTL } = useUI()
  const { filters } = useWorker()
  const { setWorkerFilters, resetWorkerFilters } = useConnectorStore()

  // Local state for filter changes
  const [localFilters, setLocalFilters] = useState<Partial<FilterState>>(filters)

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters)
    }
  }, [isOpen, filters])

  const handleApply = () => {
    setWorkerFilters(localFilters)
    onApply?.(localFilters)
    onClose()
  }

  const handleReset = () => {
    resetWorkerFilters()
    setLocalFilters({
      day: 'all',
      maxDistance: 50,
      instantOnly: false,
      teamsOnly: false,
      verifiedOnly: false,
    })
  }

  const dayOptions: { value: DayFilter; labelKey: string }[] = [
    { value: 'all', labelKey: 'filter.all' },
    { value: 'today', labelKey: 'filter.today' },
    { value: 'tomorrow', labelKey: 'filter.tomorrow' },
    { value: 'week', labelKey: 'filter.week' },
  ]

  const distanceOptions = [5, 10, 20, 50, 100]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50',
              'bg-white rounded-t-3xl',
              'max-h-[85vh] overflow-hidden',
              'safe-area-pb'
            )}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-brand-primary" />
                <h2 className="text-lg font-semibold">
                  {t('common.filter', language)}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4 overflow-y-auto max-h-[calc(85vh-140px)] space-y-6">
              {/* Day filter */}
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-3">
                  {t('task.when', language)}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dayOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setLocalFilters({ ...localFilters, day: option.value })}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-medium',
                        'transition-all duration-200',
                        localFilters.day === option.value
                          ? 'bg-brand-primary text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      )}
                    >
                      {t(option.labelKey as any, language)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance */}
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-3">
                  {t('filter.distance', language)} (km)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {distanceOptions.map((km) => (
                    <button
                      key={km}
                      onClick={() => setLocalFilters({ ...localFilters, maxDistance: km })}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-medium',
                        'transition-all duration-200',
                        localFilters.maxDistance === km
                          ? 'bg-brand-primary text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      )}
                    >
                      {km} km
                    </button>
                  ))}
                </div>
              </div>

              {/* Rate range */}
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-3">
                  {t('filter.rate', language)} (₪/hour)
                </h3>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localFilters.minRate || ''}
                    onChange={(e) => setLocalFilters({
                      ...localFilters,
                      minRate: e.target.value ? Number(e.target.value) : undefined
                    })}
                    className={cn(
                      'flex-1 px-4 py-2 rounded-xl',
                      'bg-neutral-100 border-none',
                      'text-sm placeholder:text-neutral-400',
                      'focus:outline-none focus:ring-2 focus:ring-brand-primary'
                    )}
                  />
                  <span className="text-neutral-400">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localFilters.maxRate || ''}
                    onChange={(e) => setLocalFilters({
                      ...localFilters,
                      maxRate: e.target.value ? Number(e.target.value) : undefined
                    })}
                    className={cn(
                      'flex-1 px-4 py-2 rounded-xl',
                      'bg-neutral-100 border-none',
                      'text-sm placeholder:text-neutral-400',
                      'focus:outline-none focus:ring-2 focus:ring-brand-primary'
                    )}
                  />
                </div>
              </div>

              {/* Toggle filters */}
              <div className="space-y-3">
                <ToggleOption
                  label={t('filter.instant.only', language)}
                  checked={localFilters.instantOnly || false}
                  onChange={(checked) => setLocalFilters({ ...localFilters, instantOnly: checked })}
                />
                <ToggleOption
                  label={t('filter.teams.only', language)}
                  checked={localFilters.teamsOnly || false}
                  onChange={(checked) => setLocalFilters({ ...localFilters, teamsOnly: checked })}
                />
                <ToggleOption
                  label={t('filter.verified.only', language)}
                  checked={localFilters.verifiedOnly || false}
                  onChange={(checked) => setLocalFilters({ ...localFilters, verifiedOnly: checked })}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-neutral-100">
              <Button
                variant="ghost"
                size="md"
                onClick={handleReset}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleApply}
              >
                {t('common.save', language)}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface ToggleOptionProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ToggleOption({ label, checked, onChange }: ToggleOptionProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between py-2"
    >
      <span className="text-sm text-neutral-700">{label}</span>
      <div
        className={cn(
          'w-11 h-6 rounded-full p-0.5 transition-colors duration-200',
          checked ? 'bg-brand-primary' : 'bg-neutral-200'
        )}
      >
        <motion.div
          className="w-5 h-5 rounded-full bg-white shadow"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  )
}

export default FilterSheet
