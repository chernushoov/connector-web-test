'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { Header, Navigation, EmptyState, LoadingState } from '@/components/shared'
import { Button } from '@/components/ui/Button'
import {
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  DollarSign,
  MessageCircle,
  Phone,
  Eye,
  ChevronRight,
} from 'lucide-react'
import type { Language } from '@/types'

interface Application {
  id: string
  shiftId: string
  shiftTitle: string
  companyName: string
  city: string
  date: string
  startTime: string
  endTime: string
  hourlyRate: number
  status: 'applied' | 'reviewing' | 'approved' | 'rejected' | 'withdrawn' | 'expired'
  appliedAt: string
  employerPhone?: string
}

type TabFilter = 'all' | 'pending' | 'approved' | 'rejected'

const statusConfig = {
  applied: { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: Clock },
  reviewing: { label: 'Reviewing', color: 'bg-amber-100 text-amber-700', icon: Eye },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  withdrawn: { label: 'Withdrawn', color: 'bg-neutral-100 text-neutral-600', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-neutral-100 text-neutral-500', icon: Clock },
}

export default function WorkerApplicationsPage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { showToast } = useConnectorStore()

  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabFilter>('all')

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/applications')
      if (res.ok) {
        const data = await res.json()
        setApplications(data.applications || [])
      }
    } catch {
      // empty
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdraw = async (appId: string) => {
    if (!confirm('Withdraw this application?')) return
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'withdraw' }),
      })
      if (res.ok) {
        setApplications(prev =>
          prev.map(a => a.id === appId ? { ...a, status: 'withdrawn' as const } : a)
        )
        showToast('Application withdrawn', 'success')
      }
    } catch {
      showToast('Failed to withdraw', 'error')
    }
  }

  const filteredApps = applications.filter((app) => {
    if (activeTab === 'all') return true
    if (activeTab === 'pending') return ['applied', 'reviewing'].includes(app.status)
    if (activeTab === 'approved') return app.status === 'approved'
    if (activeTab === 'rejected') return ['rejected', 'withdrawn', 'expired'].includes(app.status)
    return true
  })

  const tabs: { id: TabFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Declined' },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 pb-20" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header title="My Applications" showBack showNotifications />

      {/* Tabs */}
      <div className="px-4 py-3 bg-white border-b border-neutral-100">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-4">
        {isLoading ? (
          <LoadingState variant="skeleton" />
        ) : filteredApps.length === 0 ? (
          <EmptyState
            type="no-applications"
            title="No applications yet"
            subtitle="Apply to shifts and track your applications here"
            action={{
              label: 'Browse Shifts',
              onClick: () => router.push('/worker'),
            }}
          />
        ) : (
          <motion.div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredApps.map((app, index) => {
                const config = statusConfig[app.status]
                const StatusIcon = config.icon
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-neutral-200 p-4"
                  >
                    {/* Status badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium', config.color)}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {config.label}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Shift info */}
                    <h3 className="font-semibold text-neutral-900 mb-1">{app.shiftTitle}</h3>
                    <p className="text-sm text-neutral-600 mb-3">{app.companyName}</p>

                    <div className="flex flex-wrap gap-3 text-sm text-neutral-500 mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {app.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {app.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        {app.hourlyRate} ILS/hr
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {app.status === 'approved' && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            leftIcon={<MessageCircle className="w-3.5 h-3.5" />}
                            onClick={() => router.push('/chat')}
                            className="flex-1"
                          >
                            Chat
                          </Button>
                          {app.employerPhone && (
                            <Button
                              size="sm"
                              variant="outline"
                              leftIcon={<Phone className="w-3.5 h-3.5" />}
                              onClick={() => window.open(`tel:${app.employerPhone}`)}
                            >
                              Call
                            </Button>
                          )}
                        </>
                      )}
                      {['applied', 'reviewing'].includes(app.status) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => handleWithdraw(app.id)}
                        >
                          Withdraw
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/worker/shifts/${app.shiftId}`)}
                        className="ml-auto"
                      >
                        View Shift
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <Navigation />
    </div>
  )
}
