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
import type { ShiftPosting } from '@/types'

// Mock data
const mockShifts: ShiftPosting[] = [
  {
    id: '1',
    title: 'Warehouse Helper',
    description: 'Loading and unloading goods',
    employer: {
      id: 'emp1',
      name: 'Me',
      company: 'My Company',
      phone: '+972501234567',
      rating: 4.8,
      reviewCount: 156,
      totalPaid: 125000,
      isVerified: true,
    },
    location: { latitude: 32.0853, longitude: 34.7818, address: 'Tel Aviv Port' },
    city: 'Tel Aviv',
    date: new Date(),
    startTime: '08:00',
    endTime: '16:00',
    urgency: 'instant',
    baseRate: 55,
    surgeMultiplier: 1.0,
    totalEstimate: 440,
    paymentGuarantee: true,
    slots: 5,
    filled: 3,
    applicants: 8,
    requirements: { needsCar: false, needsTools: false, needsTeam: 0, minExperience: 0, minRating: 3.5 },
    requiredSkills: ['warehouse'],
    status: 'open',
    isInstant: true,
    acceptsTeams: false,
    hasEscrow: true,
    hasInsurance: true,
    workplaceRating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date(),
    viewCount: 45,
  },
  {
    id: '2',
    title: 'Event Setup Crew',
    description: 'Corporate event setup',
    employer: {
      id: 'emp1',
      name: 'Me',
      company: 'My Company',
      phone: '+972501234567',
      rating: 4.8,
      reviewCount: 156,
      totalPaid: 125000,
      isVerified: true,
    },
    location: { latitude: 32.1053, longitude: 34.8018, address: 'Herzliya' },
    city: 'Herzliya',
    date: new Date(Date.now() + 172800000),
    startTime: '06:00',
    endTime: '14:00',
    urgency: 'scheduled',
    baseRate: 70,
    surgeMultiplier: 1.0,
    totalEstimate: 560,
    paymentGuarantee: true,
    slots: 10,
    filled: 4,
    applicants: 12,
    requirements: { needsCar: false, needsTools: false, needsTeam: 0, minExperience: 0, minRating: 3.0 },
    requiredSkills: ['events'],
    status: 'open',
    isInstant: false,
    acceptsTeams: true,
    hasEscrow: true,
    hasInsurance: true,
    workplaceRating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date(),
    viewCount: 67,
  },
]

export default function EmployerDashboard() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { myShifts, isLoadingShifts, totalPaid, activeWorkers, shiftsThisMonth, pendingApplications } = useEmployer()
  const { setMode, loadMyShifts, showToast } = useConnectorStore()

  const [displayShifts, setDisplayShifts] = useState<ShiftPosting[]>(mockShifts)

  // Set mode on mount
  useEffect(() => {
    setMode('employer')
    loadMyShifts()
  }, [setMode, loadMyShifts])

  useEffect(() => {
    if (myShifts.length > 0) {
      setDisplayShifts(myShifts)
    }
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
        onNotifications={() => router.push('/notifications')}
        rightContent={
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/employer/create-shift')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Post
          </Button>
        }
      />

      <main className="px-4 py-4 space-y-6">
        {/* Stats overview */}
        <section>
          <div className="grid grid-cols-2 gap-3">
            <StatsCard
              icon={<DollarSign className="w-5 h-5" />}
              label="Total paid"
              value={`₪${totalPaid.toLocaleString()}`}
            />
            <StatsCard
              icon={<Users className="w-5 h-5" />}
              label="Active workers"
              value={activeWorkers}
            />
            <StatsCard
              icon={<Briefcase className="w-5 h-5" />}
              label="Shifts this month"
              value={shiftsThisMonth}
            />
            <StatsCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Pending applicants"
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
                    {totalApplicants} applicants waiting
                  </h3>
                  <p className="text-sm opacity-80">
                    Review and approve workers
                  </p>
                </div>
              </div>
              <Button
                variant="outline-white"
                size="sm"
                onClick={() => router.push('/employer/applicants')}
              >
                Review
              </Button>
            </div>
          </motion.div>
        )}

        {/* Quick actions */}
        <section>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <QuickActionButton
              icon={<Plus className="w-5 h-5" />}
              label="New shift"
              onClick={() => router.push('/employer/create-shift')}
              highlight
            />
            <QuickActionButton
              icon={<Users className="w-5 h-5" />}
              label="All applicants"
              onClick={() => router.push('/employer/applicants')}
            />
            <QuickActionButton
              icon={<Briefcase className="w-5 h-5" />}
              label="My shifts"
              onClick={() => router.push('/employer/my-shifts')}
            />
            <QuickActionButton
              icon={<Search className="w-5 h-5" />}
              label="Find workers"
              onClick={() => router.push('/search')}
            />
          </div>
        </section>

        {/* Active shifts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              Active Shifts
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/employer/my-shifts')}
            >
              See all
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
                      showToast('Link copied to clipboard', 'success')
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
