'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useWorker, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { Header, Navigation, EmptyState, LoadingState } from '@/components/shared'
import { TaskFlowCard } from '@/components/worker'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, Clock, Play, Star } from 'lucide-react'
import type { TaskFlow, TaskFlowStatus, Language } from '@/types'

type TabFilter = 'all' | 'active' | 'completed' | 'pending'

export default function MyTasksPage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { myTasks, isLoadingTasks } = useWorker()
  const { loadMyTasks, cancelApplication, showToast } = useConnectorStore()

  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [displayTasks, setDisplayTasks] = useState<TaskFlow[]>([])

  useEffect(() => {
    loadMyTasks()
  }, [loadMyTasks])

  useEffect(() => {
    setDisplayTasks(myTasks)
  }, [myTasks])

  const filteredTasks = displayTasks.filter((task) => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return ['in_progress', 'approved', 'upcoming'].includes(task.status)
    if (activeTab === 'completed') return ['completed', 'paid', 'reviewed'].includes(task.status)
    if (activeTab === 'pending') return ['applied', 'reviewing'].includes(task.status)
    return true
  })

  const tabs: { id: TabFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: t('tabs.all', language as Language), icon: null },
    { id: 'active', label: t('tabs.active', language as Language), icon: <Play className="w-4 h-4" /> },
    { id: 'pending', label: t('tabs.pending', language as Language), icon: <Clock className="w-4 h-4" /> },
    { id: 'completed', label: t('tabs.completed', language as Language), icon: <CheckCircle2 className="w-4 h-4" /> },
  ]

  const handleTaskAction = async (taskId: string, action: string) => {
    const task = displayTasks.find(t => t.id === taskId)

    switch (action) {
      case 'start':
        showToast(t('toast.shiftStarted', language as Language), 'success')
        setDisplayTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: 'in_progress' as const, startedAt: new Date() } : t
        ))
        break
      case 'complete':
        showToast(t('toast.shiftCompleted', language as Language), 'success')
        setDisplayTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: 'completed' as const, completedAt: new Date() } : t
        ))
        break
      case 'cancel':
        if (confirm(t('confirm.cancelApplication', language as Language))) {
          await cancelApplication(taskId)
          setDisplayTasks(prev => prev.filter(t => t.id !== taskId))
        }
        break
      case 'message':
        if (task?.shift?.employer?.phone) {
          window.open(`tel:${task.shift.employer.phone}`, '_blank')
        } else {
          showToast(t('toast.contactNotAvailable', language as Language), 'warning')
        }
        break
      case 'view':
        router.push(`/shift/${task?.shiftId}`)
        break
      case 'review':
        router.push(`/review/${taskId}`)
        break
      default:
        showToast(t('toast.actionNotImplemented', language as Language), 'info')
    }
  }

  return (
    <div
      className="min-h-screen bg-neutral-50 pb-20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Header
        title={t('page.myTasks', language as Language)}
        showBack
        showNotifications
      />

      {/* Tabs */}
      <div className="px-4 py-3 bg-white border-b border-neutral-100">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full',
                'text-sm font-medium whitespace-nowrap',
                'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50',
                activeTab === tab.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-4">
        {isLoadingTasks ? (
          <LoadingState variant="skeleton" />
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            type="no-tasks"
            title={t('empty.noTasks', language as Language)}
            subtitle={t('empty.noTasks.subtitle', language as Language)}
            action={{
              label: t('worker.browseShifts', language as Language),
              onClick: () => router.push('/worker')
            }}
          />
        ) : (
          <motion.div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TaskFlowCard
                    task={task}
                    onAction={(action) => handleTaskAction(task.id, action)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <Navigation />
    </div>
  )
}
