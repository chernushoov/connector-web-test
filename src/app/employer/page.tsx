'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useEmployer, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { Header, Navigation, LoadingState, EmptyState } from '@/components/shared'
import { ShiftManagement, QuickHireButton } from '@/components/employer'
import { StatsCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Plus,
  DollarSign,
  Users,
  Briefcase,
  TrendingUp,
  Bell,
  Search
} from 'lucide-react'
import type { ShiftPosting, Language } from '@/types'

export default function EmployerDashboard() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { myShifts, isLoadingShifts, totalPaid, activeWorkers, shiftsThisMonth, pendingApplications } = useEmployer()
  const { setMode, loadMyShifts, showToast } = useConnectorStore()

  const [displayShifts, setDisplayShifts] = useState<ShiftPosting[]>([])

  // Set mode on mount
  useEffect(() => {
    setMode('employer')
    loadMyShifts()
  }, [setMode, loadMyShifts])

  useEffect(() => {
    setDisplayShifts(myShifts)
  }, [myShifts])

  const totalApplicants = displayShifts.reduce((sum, s) => sum + s.applicants, 0)

  return (
    <div
      className="min-h-screen bg-neutral-50 pb-20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <Header
        titleKey="employer.mode.title"
        showNotifications
        showTrialBadge
        onNotifications={() => router.push('/notifications')}
        rightContent={
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/employer/create-shift')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {t('employer.post', language as Language)}
          </Button>
        }
      />

      <main className="px-4 py-4 space-y-6">
        {/* Stats overview */}
        <section>
          <div className="grid grid-cols-2 gap-3">
            <StatsCard
              icon={<DollarSign className="w-5 h-5" />}
              label={t('employer.totalPaid', language as Language)}
              value={`₪${totalPaid.toLocaleString()}`}
            />
            <StatsCard
              icon={<Users className="w-5 h-5" />}
              label={t('employer.activeWorkers', language as Language)}
              value={activeWorkers}
            />
            <StatsCard
              icon={<Briefcase className="w-5 h-5" />}
              label={t('employer.shiftsThisMonth', language as Language)}
              value={shiftsThisMonth}
            />
            <StatsCard
              icon={<TrendingUp className="w-5 h-5" />}
              label={t('employer.pendingApplicants', language as Language)}
              value={totalApplicants}
              change={totalApplicants > 0 ? 100 : 0}
              trend="up"
            />
          </div>
        </section>

        {/* Pending applicants banner */}
        {totalApplicants > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-brand text-white p-4 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {totalApplicants} {t('employer.applicantsWaiting', language as Language)}
                  </h3>
                  <p className="text-sm opacity-80">
                    {t('employer.reviewApprove', language as Language)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline-white"
                size="sm"
                onClick={() => router.push('/employer/applicants')}
              >
                {t('employer.review', language as Language)}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Quick actions */}
        <section>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <QuickActionButton
              icon={<Plus className="w-5 h-5" />}
              label={t('employer.newShift', language as Language)}
              onClick={() => router.push('/employer/create-shift')}
              highlight
            />
            <QuickActionButton
              icon={<Users className="w-5 h-5" />}
              label={t('employer.allApplicants', language as Language)}
              onClick={() => router.push('/employer/applicants')}
            />
            <QuickActionButton
              icon={<Briefcase className="w-5 h-5" />}
              label={t('page.myShifts', language as Language)}
              onClick={() => router.push('/employer/my-shifts')}
            />
            <QuickActionButton
              icon={<Search className="w-5 h-5" />}
              label={t('employer.findWorkers', language as Language)}
              onClick={() => router.push('/search')}
            />
          </div>
        </section>

        {/* Active shifts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              {t('employer.activeShifts', language as Language)}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/employer/my-shifts')}
            >
              {t('employer.seeAll', language as Language)}
            </Button>
          </div>

          {isLoadingShifts ? (
            <LoadingState variant="skeleton" />
          ) : displayShifts.length === 0 ? (
            <QuickHireButton
              variant="card"
              onClick={() => router.push('/employer/create-shift')}
            />
          ) : (
            <div className="space-y-4">
              {displayShifts.map((shift, index) => (
                <motion.div
                  key={shift.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ShiftManagement
                    shift={shift}
                    onEdit={() => router.push(`/employer/shift/${shift.id}`)}
                    onViewApplicants={() => router.push(`/employer/shift/${shift.id}`)}
                    onShare={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/shift/${shift.id}`)
                      showToast(t('common.copied', language as Language), 'success')
                    }}
                    onDuplicate={() => {
                      router.push(`/employer/create-shift?duplicate=${shift.id}`)
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* FAB */}
      <QuickHireButton
        variant="fab"
        onClick={() => router.push('/employer/create-shift')}
      />

      {/* Navigation */}
      <Navigation />
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
