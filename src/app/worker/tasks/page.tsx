'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardList,
  ChevronRight,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { cn } from '@/lib/utils'

// ---------------------
// Inline types
// ---------------------

type TaskFlowTab = 'active' | 'completed'

type TaskFlowStatus =
  | 'applied'
  | 'reviewing'
  | 'approved'
  | 'upcoming'
  | 'in_progress'
  | 'completed'
  | 'reviewed'
  | 'payment_pending'
  | 'paid'
  | 'rejected'
  | 'cancelled'
  | 'disputed'

interface TaskFlowItem {
  id: string
  shiftTitle: string
  employerName: string
  status: TaskFlowStatus
  currentStep: number
  totalSteps: number
  startDate: string
  endDate: string
  agreedRate: number
  cityCode: string
  isInstant: boolean
}

// ---------------------
// Status helpers
// ---------------------

const STATUS_CONFIG: Record<
  TaskFlowStatus,
  { color: string; bgColor: string; borderColor: string }
> = {
  applied: { color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  reviewing: { color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  approved: { color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  upcoming: { color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  in_progress: { color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  completed: { color: 'text-neutral-700', bgColor: 'bg-neutral-100', borderColor: 'border-neutral-200' },
  reviewed: { color: 'text-neutral-700', bgColor: 'bg-neutral-100', borderColor: 'border-neutral-200' },
  payment_pending: { color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  paid: { color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  rejected: { color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  cancelled: { color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  disputed: { color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
}

function getStatusLabel(status: TaskFlowStatus): string {
  const labels: Record<TaskFlowStatus, string> = {
    applied: 'Applied',
    reviewing: 'Reviewing',
    approved: 'Approved',
    upcoming: 'Upcoming',
    in_progress: 'In Progress',
    completed: 'Completed',
    reviewed: 'Reviewed',
    payment_pending: 'Payment Pending',
    paid: 'Paid',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    disputed: 'Disputed',
  }
  return labels[status] || status
}

// ---------------------
// Page
// ---------------------

export default function WorkerTasksPage() {
  const { language, isRTL } = useUI()
  const router = useRouter()

  const [tab, setTab] = useState<TaskFlowTab>('active')
  const [tasks, setTasks] = useState<TaskFlowItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async (filter: TaskFlowTab) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/taskflow?role=worker&filter=${filter}`)
      const json = await res.json()
      setTasks(json.data || [])
    } catch (e) {
      console.error('Failed to fetch tasks:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks(tab)
  }, [tab, fetchTasks])

  const tabs: { key: TaskFlowTab; label: string; icon: React.ReactNode }[] = [
    { key: 'active', label: t('status.in_progress', language), icon: <Clock className="w-4 h-4" /> },
    { key: 'completed', label: t('status.completed', language), icon: <CheckCircle2 className="w-4 h-4" /> },
  ]

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-neutral-200">
        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-brand-primary" />
          <h1 className="text-xl font-bold text-neutral-900">
            {t('tabs.tasks', language)}
          </h1>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-3 flex gap-2">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5',
                tab === item.key
                  ? 'bg-brand-primary text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="px-4 py-4 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="h-5 bg-neutral-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-neutral-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-neutral-100 rounded w-full mb-2" />
              <div className="h-2 bg-neutral-100 rounded w-2/3" />
            </div>
          ))
        ) : tasks.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600 font-medium">
              {tab === 'active' ? t('empty.no.tasks', language) : t('empty.no.results', language)}
            </p>
            <p className="text-neutral-400 text-sm mt-1">
              {tab === 'active'
                ? t('empty.no.tasks.subtitle', language)
                : t('empty.no.results.subtitle', language)}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <TaskFlowCard
                  task={task}
                  onClick={() => router.push(`/worker/tasks/${task.id}`)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

// ---------------------
// TaskFlowCard
// ---------------------

function TaskFlowCard({
  task,
  onClick,
}: {
  task: TaskFlowItem
  onClick: () => void
}) {
  const config = STATUS_CONFIG[task.status] || STATUS_CONFIG.applied
  const progressPercent = task.totalSteps > 0
    ? Math.round((task.currentStep / task.totalSteps) * 100)
    : 0

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Title + badge */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-neutral-900 truncate">
              {task.shiftTitle}
            </h3>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium border',
                config.bgColor,
                config.color,
                config.borderColor
              )}
            >
              {getStatusLabel(task.status)}
            </span>
          </div>

          {/* Employer */}
          <p className="text-sm text-neutral-500">{task.employerName}</p>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {task.startDate}
            </span>
            {task.cityCode && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {task.cityCode}
              </span>
            )}
            <span className="font-semibold text-brand-primary">
              {'\u20AA'}{task.agreedRate}/h
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-neutral-400">
                Step {task.currentStep} / {task.totalSteps}
              </span>
              <span className="text-xs text-neutral-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-brand-primary transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-neutral-300 flex-shrink-0 mt-1 ml-2" />
      </div>
    </button>
  )
}
