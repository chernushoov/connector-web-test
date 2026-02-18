'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore, useFreeWorld } from '@/store'
import { t } from '@/i18n/translations'
import { RoleTabBar } from '@/components/shared'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/Input'
import {
  Briefcase,
  MapPin,
  Clock,
  Loader2,
} from 'lucide-react'
import type { QuickTaskDB, TaskSchedule } from '@/types'
import { TASK_CATEGORIES } from '@/types'

type ScheduleFilter = 'all' | TaskSchedule

export default function FreeExecutePage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { setMode, loadTasks } = useConnectorStore() as any
  const { tasks, isLoadingTasks } = useFreeWorld() as any

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [scheduleFilter, setScheduleFilter] = useState<ScheduleFilter>('all')
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const taskList = tasks || []

  useEffect(() => {
    setMode('free-world')
    loadTasks?.().then((result: any) => {
      if (result) setHasMore(result.hasMore)
    })
  }, [setMode, loadTasks])

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    const result = await loadTasks?.(undefined, { loadMore: true })
    if (result) setHasMore(result.hasMore)
    setIsLoadingMore(false)
  }

  const filteredTasks = useMemo(() =>
    taskList.filter((task: QuickTaskDB) => {
      if (task.status !== 'OPEN') return false
      if (categoryFilter && task.category !== categoryFilter) return false
      if (scheduleFilter !== 'all' && task.schedule !== scheduleFilter) return false
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        task.title.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query) ||
        task.addressText.toLowerCase().includes(query)
      )
    }),
    [taskList, searchQuery, categoryFilter, scheduleFilter]
  )

  const handleTaskClick = useCallback((task: QuickTaskDB) => {
    router.push(`/free/task/${task.id}`)
  }, [router])

  const formatBudget = (task: QuickTaskDB) => {
    if (task.budgetType === 'NEGOTIABLE') return 'Negotiable'
    if (task.budgetType === 'RANGE' && task.budgetMin && task.budgetMax) {
      return `\u20AA${task.budgetMin} - ${task.budgetMax}`
    }
    if (task.budgetMin) return `\u20AA${task.budgetMin}`
    return 'Not specified'
  }

  const formatSchedule = (task: QuickTaskDB) => {
    switch (task.schedule) {
      case 'NOW': return 'Now'
      case 'TODAY': return 'Today'
      case 'TOMORROW': return 'Tomorrow'
      case 'SCHEDULED':
        return task.scheduledAt
          ? new Date(task.scheduledAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
          : 'Scheduled'
      default: return ''
    }
  }

  const scheduleOptions: { value: ScheduleFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'NOW', label: 'Now' },
    { value: 'TODAY', label: 'Today' },
    { value: 'TOMORROW', label: 'Tomorrow' },
    { value: 'SCHEDULED', label: 'By Date' },
  ]

  return (
    <div
      className={cn('min-h-screen bg-neutral-50 pb-20')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="bg-white px-4 py-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">
              Find Tasks
            </h1>
            <p className="text-sm text-neutral-500">
              Available tasks for execution
            </p>
          </div>
        </div>

        {/* Search */}
        <SearchInput
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-3"
        />

        {/* Schedule filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {scheduleOptions.map((option) => (
            <Button
              key={option.value}
              variant={scheduleFilter === option.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setScheduleFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Category chips */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setCategoryFilter(null)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            categoryFilter === null
              ? 'bg-brand-primary text-white'
              : 'bg-white text-neutral-600 border border-neutral-200'
          )}
        >
          All Categories
        </button>
        {TASK_CATEGORIES.map((cat) => (
          <button
            key={cat.code}
            onClick={() => setCategoryFilter(
              categoryFilter === cat.code ? null : cat.code
            )}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              categoryFilter === cat.code
                ? 'bg-brand-primary text-white'
                : 'bg-white text-neutral-600 border border-neutral-200'
            )}
          >
            {cat.icon} {cat.labelEn}
          </button>
        ))}
      </div>

      {/* Tasks list */}
      <div className="px-4 pb-4">
        {/* Loading */}
        {isLoadingTasks && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
          </div>
        )}

        {/* Results count */}
        {!isLoadingTasks && filteredTasks.length > 0 && (
          <p className="text-sm text-neutral-500 mb-3">
            Found: {filteredTasks.length} tasks
          </p>
        )}

        {/* Task cards */}
        {!isLoadingTasks && filteredTasks.length > 0 && (
          <div className="space-y-3">
            {filteredTasks.map((task: QuickTaskDB, index: number) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-neutral-900 truncate">
                          {task.title}
                        </span>
                        {task.schedule === 'NOW' && (
                          <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded flex-shrink-0">
                            Urgent
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-neutral-500 line-clamp-2 mb-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {task.addressText.split(',')[0]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatSchedule(task)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-neutral-400 capitalize">
                          {task.category}
                        </span>
                        <span className="font-semibold text-brand-primary">
                          {formatBudget(task)}
                        </span>
                      </div>
                      {task.offersCount !== undefined && task.offersCount > 0 && (
                        <div className="mt-2 text-xs text-neutral-500">
                          {task.offersCount} offers
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {/* Load more button */}
            {hasMore && !searchQuery && !categoryFilter && scheduleFilter === 'all' && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!isLoadingTasks && filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
            <p className="text-neutral-500">
              {searchQuery || categoryFilter || scheduleFilter !== 'all'
                ? 'No tasks found for your filters'
                : 'No tasks available yet'}
            </p>
            {(searchQuery || categoryFilter || scheduleFilter !== 'all') && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('')
                  setCategoryFilter(null)
                  setScheduleFilter('all')
                }}
              >
                Reset Filters
              </Button>
            )}
          </div>
        )}
      </div>

      <RoleTabBar />
    </div>
  )
}
