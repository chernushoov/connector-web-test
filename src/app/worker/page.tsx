'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useWorker, useAuth, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { Header, Navigation, FilterSheet, LoadingState } from '@/components/shared'
import { ShiftFeed, ShiftDetail } from '@/components/worker'
import { Card, StatsCard } from '@/components/ui/Card'
import { Button, IconButton } from '@/components/ui/Button'
import {
  SlidersHorizontal,
  Bell,
  TrendingUp,
  DollarSign,
  Briefcase,
  Calendar,
  Zap,
  Search
} from 'lucide-react'
import type { ShiftPosting } from '@/types'

export default function WorkerDashboard() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { isAuthenticated } = useAuth()
  const { totalEarned, completedShifts, upcomingShifts, isLoadingShifts } = useWorker()
  const { setMode, setWorkerFilters } = useConnectorStore()

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<ShiftPosting | null>(null)

  // Set mode on mount
  useEffect(() => {
    setMode('worker')
  }, [setMode])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/worker')
    }
  }, [isAuthenticated, router])

  const handleShiftClick = (shift: ShiftPosting) => {
    setSelectedShift(shift)
  }

  const handleCloseDetail = () => {
    setSelectedShift(null)
  }

  return (
    <div
      className="min-h-screen bg-neutral-50 pb-20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <Header
        titleKey="worker.mode.title"
        showNotifications
        showTrialBadge
        onNotifications={() => router.push('/notifications')}
        rightContent={
          <IconButton
            icon={<SlidersHorizontal className="w-5 h-5" />}
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsFilterOpen(true)}
            aria-label={t('common.filter', language)}
          />
        }
      />

      <main className="px-4 py-4 space-y-6">
        {/* Stats overview */}
        <section>
          <div className="grid grid-cols-3 gap-3">
            <StatsCard
              icon={<DollarSign className="w-5 h-5" />}
              label={t('profile.earned', language as any)}
              value={`₪${totalEarned.toLocaleString()}`}
              trend="up"
              change={12}
            />
            <StatsCard
              icon={<Briefcase className="w-5 h-5" />}
              label={t('profile.shifts.completed', language as any)}
              value={completedShifts}
            />
            <StatsCard
              icon={<Calendar className="w-5 h-5" />}
              label="Upcoming"
              value={upcomingShifts}
            />
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <QuickActionButton
              icon={<Zap className="w-5 h-5" />}
              label={t('shift.instant', language as any)}
              onClick={() => {
                setWorkerFilters({ instantOnly: true })
                setIsFilterOpen(true)
              }}
              highlight
            />
            <QuickActionButton
              icon={<Calendar className="w-5 h-5" />}
              label={t('filter.today', language as any)}
              onClick={() => {
                setWorkerFilters({ day: 'today' })
                setIsFilterOpen(true)
              }}
            />
            <QuickActionButton
              icon={<TrendingUp className="w-5 h-5" />}
              label="Top paying"
              onClick={() => {
                setWorkerFilters({ minRate: 60 })
                setIsFilterOpen(true)
              }}
            />
            <QuickActionButton
              icon={<Search className="w-5 h-5" />}
              label={t('common.search', language as any)}
              onClick={() => router.push('/search')}
            />
          </div>
        </section>

        {/* Recommended shifts banner */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-brand text-white p-4 rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Smart Match Active</h3>
              <p className="text-sm opacity-80 mt-1">
                We'll notify you when perfect shifts appear
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </motion.section>

        {/* Shifts feed */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              Available Shifts
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFilterOpen(true)}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            >
              {t('common.filter', language as any)}
            </Button>
          </div>

          {isLoadingShifts ? (
            <LoadingState variant="skeleton" />
          ) : (
            <ShiftFeed onShiftClick={handleShiftClick} />
          )}
        </section>
      </main>

      {/* Navigation */}
      <Navigation />

      {/* Filter sheet */}
      <FilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      {/* Shift detail modal */}
      {selectedShift && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-white overflow-y-auto"
        >
          <Header
            showBack
            onBack={handleCloseDetail}
            title={selectedShift.title}
          />
          <ShiftDetail
            shift={selectedShift}
            onApply={handleCloseDetail}
            onClose={handleCloseDetail}
          />
        </motion.div>
      )}
    </div>
  )
}

function QuickActionButton({
  icon,
  label,
  onClick,
  highlight
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  highlight?: boolean
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-full',
        'whitespace-nowrap transition-all',
        highlight
          ? 'bg-gradient-brand text-white shadow-glow-primary'
          : 'bg-white text-neutral-700 shadow-card hover:shadow-card-hover'
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </motion.button>
  )
}
