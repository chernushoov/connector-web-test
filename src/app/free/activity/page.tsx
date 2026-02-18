'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore, useFreeWorld } from '@/store'
import { t } from '@/i18n/translations'
import type { QuickTaskDB, Offer } from '@/types'
import { RoleTabBar } from '@/components/shared'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Activity,
  Package,
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  MessageCircle,
  AlertCircle,
} from 'lucide-react'

type ActivityTab = 'my-tasks' | 'my-responses'

const mapTaskStatus = (status: string): string => {
  switch (status) {
    case 'OPEN': return 'open'
    case 'ASSIGNED': return 'in_progress'
    case 'COMPLETED': return 'completed'
    case 'CANCELLED': return 'cancelled'
    default: return 'open'
  }
}

const mapOfferStatus = (status: string): string => {
  switch (status) {
    case 'PENDING': return 'pending'
    case 'ACCEPTED': return 'accepted'
    case 'REJECTED': return 'rejected'
    case 'WITHDRAWN': return 'withdrawn'
    default: return 'pending'
  }
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  open: { label: 'Open', color: 'text-blue-600 bg-blue-50', icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-amber-600 bg-amber-50', icon: AlertCircle },
  completed: { label: 'Completed', color: 'text-success bg-success/10', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-neutral-600 bg-neutral-100', icon: XCircle },
  pending: { label: 'Pending', color: 'text-blue-600 bg-blue-50', icon: Clock },
  accepted: { label: 'Accepted', color: 'text-success bg-success/10', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'text-danger bg-danger/10', icon: XCircle },
  withdrawn: { label: 'Withdrawn', color: 'text-neutral-600 bg-neutral-100', icon: XCircle },
}

const categoryIcons: Record<string, typeof Package> = {
  delivery: Package,
  repair: Wrench,
  transport: Package,
}

export default function FreeActivityPage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { setMode, loadMyCreatedTasks, loadOffers } = useConnectorStore()
  const { myCreatedTasks, myOffers, isLoadingTasks, isLoadingOffers } = useFreeWorld()
  const [activeTab, setActiveTab] = useState<ActivityTab>('my-tasks')
  const [hasMoreOffers, setHasMoreOffers] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    setMode('free-world')
    loadMyCreatedTasks()
    loadOffers().then((result) => { if (result) setHasMoreOffers(result.sentHasMore) })
  }, [setMode, loadMyCreatedTasks, loadOffers])

  const handleLoadMoreOffers = async () => {
    setIsLoadingMore(true)
    const result = await loadOffers({ loadMore: true })
    if (result) setHasMoreOffers(result.sentHasMore)
    setIsLoadingMore(false)
  }

  const myTasks = useMemo(() => myCreatedTasks.map((task: QuickTaskDB) => ({
    id: task.id, title: task.title, category: task.category,
    status: mapTaskStatus(task.status), budget: task.budgetMin || 0,
    responses: task.offersCount || 0, assignee: task.assignedExecutor?.name, createdAt: task.createdAt,
  })), [myCreatedTasks])

  const myResponses = useMemo(() => myOffers.map((offer: Offer) => ({
    id: offer.id, title: offer.task?.title || 'Task', company: offer.receiver?.name || 'Client',
    status: mapOfferStatus(offer.status), budget: offer.proposedPrice,
    respondedAt: offer.createdAt, date: offer.task?.scheduledAt,
  })), [myOffers])

  return (
    <div className={cn('min-h-screen bg-neutral-50 pb-20')} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white px-4 py-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center">
            <Activity className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{t('tabs.activity', language)}</h1>
            <p className="text-sm text-neutral-500">My tasks and responses</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant={activeTab === 'my-tasks' ? 'primary' : 'outline'} size="sm" onClick={() => setActiveTab('my-tasks')}>
            My Tasks ({myTasks.length})
          </Button>
          <Button variant={activeTab === 'my-responses' ? 'primary' : 'outline'} size="sm" onClick={() => setActiveTab('my-responses')}>
            My Offers ({myResponses.length})
          </Button>
        </div>
      </div>

      <div className="px-4 py-4">
        {activeTab === 'my-tasks' && (
          <>
            {isLoadingTasks ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : myTasks.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                <p className="text-neutral-500">No tasks created yet</p>
                <Button className="mt-4" onClick={() => router.push('/free/create')}>Create Task</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {myTasks.map((task, index) => {
                  const config = statusConfig[task.status] || statusConfig.open
                  const CategoryIcon = categoryIcons[task.category] || Package
                  return (
                    <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                      <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/free/task/${task.id}`)}>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                            <CategoryIcon className="w-5 h-5 text-neutral-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-neutral-900">{task.title}</h3>
                            <div className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1', config.color)}>
                              <config.icon className="w-3 h-3" />{config.label}
                            </div>
                            {task.status === 'open' && task.responses > 0 && (
                              <p className="text-sm text-brand-primary mt-2 flex items-center gap-1"><MessageCircle className="w-4 h-4" />{task.responses} offers</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-neutral-900">₪{task.budget}</p>
                            <button className="mt-2 p-1 hover:bg-neutral-100 rounded"><ChevronRight className="w-5 h-5 text-neutral-400" /></button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'my-responses' && (
          <>
            {isLoadingOffers ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : myResponses.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                <p className="text-neutral-500">No offers made yet</p>
                <Button className="mt-4" onClick={() => router.push('/free')}>Find Tasks</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {myResponses.map((response, index) => {
                  const config = statusConfig[response.status] || statusConfig.pending
                  return (
                    <motion.div key={response.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                      <Card className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-neutral-900">{response.title}</h3>
                            <p className="text-sm text-neutral-500">{response.company}</p>
                            <div className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-2', config.color)}>
                              <config.icon className="w-3 h-3" />{config.label}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-neutral-900">₪{response.budget}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
                {hasMoreOffers && (
                  <div className="text-center pt-4">
                    <Button variant="outline" size="sm" onClick={handleLoadMoreOffers} disabled={isLoadingMore}>
                      {isLoadingMore ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <RoleTabBar />
    </div>
  )
}
