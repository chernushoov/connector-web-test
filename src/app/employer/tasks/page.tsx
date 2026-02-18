'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import {
  CheckSquare,
  Clock,
  CalendarDays,
  User,
  DollarSign,
  AlertCircle,
  Inbox,
} from 'lucide-react'

interface TaskFlowItem {
  id: string
  shiftTitle: string
  workerName: string
  status: string
  startDate: string
  endDate?: string
  amount: number
  createdAt: string
}

type TabFilter = 'active' | 'completed'

const statusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'applied': return { bg: 'bg-blue-100', text: 'text-blue-700' }
    case 'reviewing': return { bg: 'bg-amber-100', text: 'text-amber-700' }
    case 'approved': return { bg: 'bg-emerald-100', text: 'text-emerald-700' }
    case 'rejected': return { bg: 'bg-red-100', text: 'text-red-600' }
    case 'upcoming': return { bg: 'bg-indigo-100', text: 'text-indigo-700' }
    case 'in_progress': return { bg: 'bg-blue-100', text: 'text-blue-700' }
    case 'completed': return { bg: 'bg-emerald-100', text: 'text-emerald-700' }
    case 'awaiting_review': return { bg: 'bg-amber-100', text: 'text-amber-700' }
    case 'reviewed': return { bg: 'bg-violet-100', text: 'text-violet-700' }
    case 'payment_pending': return { bg: 'bg-amber-100', text: 'text-amber-700' }
    case 'paid': return { bg: 'bg-emerald-100', text: 'text-emerald-700' }
    case 'cancelled': return { bg: 'bg-neutral-100', text: 'text-neutral-500' }
    case 'disputed': return { bg: 'bg-red-100', text: 'text-red-600' }
    default: return { bg: 'bg-neutral-100', text: 'text-neutral-500' }
  }
}

function TaskCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-36 bg-neutral-200 rounded" />
        <div className="h-5 w-16 bg-neutral-200 rounded-full" />
      </div>
      <div className="h-4 w-28 bg-neutral-200 rounded mb-2" />
      <div className="h-4 w-20 bg-neutral-200 rounded" />
    </div>
  )
}

export default function EmployerTasksPage() {
  const router = useRouter()
  const { language, isRTL } = useUI()

  const [activeTab, setActiveTab] = useState<TabFilter>('active')
  const [tasks, setTasks] = useState<TaskFlowItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async (filter: TabFilter) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/taskflow?role=employer&filter=${filter}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch {
      setError('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks(activeTab)
  }, [activeTab, fetchTasks])

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {t('tabs.tasks', language)}
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">TaskFlow management</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
          <CheckSquare className="w-5 h-5 text-brand-primary" />
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {(['active', 'completed'] as TabFilter[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors',
              activeTab === tab
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-white text-neutral-600 border border-neutral-200'
            )}
          >
            {tab === 'active' ? 'Active' : 'Completed'}
          </button>
        ))}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 flex items-center gap-2 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && tasks.length === 0 && !error && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">
            No {activeTab} tasks
          </h3>
          <p className="text-sm text-neutral-500">
            {activeTab === 'active'
              ? 'Your active task flows will appear here'
              : 'Completed task flows will appear here'}
          </p>
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task, idx) => {
            const badge = statusBadge(task.status)
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => router.push(`/employer/tasks/${task.id}`)}
                className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-neutral-900 text-sm truncate flex-1">
                    {task.shiftTitle}
                  </h3>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium capitalize ml-2 flex-shrink-0',
                      badge.bg,
                      badge.text
                    )}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {task.workerName}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-neutral-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {task.startDate}
                    </span>
                    {task.endDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {task.endDate}
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-brand-primary flex items-center gap-0.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    {'\u20AA'}{task.amount.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
