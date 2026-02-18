'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useEmployer, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { Header, Navigation, EmptyState, LoadingState } from '@/components/shared'
import { ShiftManagement, QuickHireButton } from '@/components/employer'
import { Button } from '@/components/ui/Button'
import { Plus, Filter, CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { ShiftPosting, ShiftStatus, Language } from '@/types'

type TabFilter = 'all' | 'open' | 'in_progress' | 'completed'

export default function MyShiftsPage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { myShifts, isLoadingShifts } = useEmployer()
  const { loadMyShifts, showToast } = useConnectorStore()

  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [displayShifts, setDisplayShifts] = useState<ShiftPosting[]>([])

  useEffect(() => {
    loadMyShifts()
  }, [loadMyShifts])

  useEffect(() => {
    setDisplayShifts(myShifts)
  }, [myShifts])

  const filteredShifts = displayShifts.filter((shift) => {
    if (activeTab === 'all') return true
    if (activeTab === 'open') return shift.status === 'open' || shift.status === 'matched'
    if (activeTab === 'in_progress') return shift.status === 'in_progress'
    if (activeTab === 'completed') return shift.status === 'completed' || shift.status === 'cancelled'
    return true
  })

  const tabs: { id: TabFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: t('tabs.all', language as Language), icon: null },
    { id: 'open', label: t('tabs.open', language as Language), icon: <Clock className="w-4 h-4" /> },
    { id: 'in_progress', label: t('tabs.active', language as Language), icon: <Clock className="w-4 h-4" /> },
    { id: 'completed', label: t('tabs.done', language as Language), icon: <CheckCircle2 className="w-4 h-4" /> },
  ]

  return (
    <div
      className="min-h-screen bg-neutral-50 pb-20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Header
        title={t('page.myShifts', language as Language)}
        showBack
        rightContent={
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.location.href = '/employer/create-shift'}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {t('common.new', language as Language)}
          </Button>
        }
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
              {tab.id !== 'all' && (
                <span className={cn(
                  'ms-1 px-1.5 py-0.5 rounded-full text-xs',
                  activeTab === tab.id
                    ? 'bg-white/20'
                    : 'bg-neutral-200'
                )}>
                  {displayShifts.filter((s) => {
                    if (tab.id === 'open') return s.status === 'open' || s.status === 'matched'
                    if (tab.id === 'in_progress') return s.status === 'in_progress'
                    if (tab.id === 'completed') return s.status === 'completed' || s.status === 'cancelled'
                    return false
                  }).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-4">
        {isLoadingShifts ? (
          <LoadingState variant="skeleton" />
        ) : filteredShifts.length === 0 ? (
          activeTab === 'all' ? (
            <QuickHireButton
              variant="card"
              onClick={() => window.location.href = '/employer/create-shift'}
            />
          ) : (
            <EmptyState
              type="no-shifts"
              title={t('empty.noShifts', language as Language)}
              subtitle={`You don't have any ${activeTab} shifts`}
            />
          )
        ) : (
          <motion.div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredShifts.map((shift, index) => (
                <motion.div
                  key={shift.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ShiftManagement
                    shift={shift}
                    onEdit={() => router.push(`/employer/shift/${shift.id}`)}
                    onViewApplicants={() => router.push(`/employer/shift/${shift.id}`)}
                    onShare={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/shift/${shift.id}`)
                      showToast(t('common.copied', language as Language), 'success')
                    }}
                    onDuplicate={() => router.push(`/employer/create-shift?duplicate=${shift.id}`)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* FAB */}
      <QuickHireButton
        variant="fab"
        onClick={() => router.push('/employer/create-shift')}
      />

      <Navigation />
    </div>
  )
}
