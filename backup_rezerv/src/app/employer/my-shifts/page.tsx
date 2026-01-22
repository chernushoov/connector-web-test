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
import type { ShiftPosting, ShiftStatus } from '@/types'

type TabFilter = 'all' | 'open' | 'in_progress' | 'completed'

// Mock data
const mockShifts: ShiftPosting[] = [
  {
    id: '1',
    title: 'Warehouse Helper',
    description: 'Loading and unloading goods',
    employer: { id: 'emp1', name: 'Me', company: 'My Company', phone: '+972501234567', rating: 4.8, reviewCount: 156, totalPaid: 125000, isVerified: true },
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
    employer: { id: 'emp1', name: 'Me', company: 'My Company', phone: '+972501234567', rating: 4.8, reviewCount: 156, totalPaid: 125000, isVerified: true },
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
  {
    id: '3',
    title: 'Moving Assistant',
    description: 'Apartment move',
    employer: { id: 'emp1', name: 'Me', company: 'My Company', phone: '+972501234567', rating: 4.8, reviewCount: 156, totalPaid: 125000, isVerified: true },
    location: { latitude: 32.0753, longitude: 34.7918, address: 'Ramat Gan' },
    city: 'Ramat Gan',
    date: new Date(Date.now() - 86400000),
    startTime: '09:00',
    endTime: '17:00',
    urgency: 'today',
    baseRate: 60,
    surgeMultiplier: 1.0,
    totalEstimate: 480,
    paymentGuarantee: true,
    slots: 3,
    filled: 3,
    applicants: 7,
    requirements: { needsCar: true, needsTools: false, needsTeam: 2, minExperience: 1, minRating: 4.0 },
    requiredSkills: ['moving', 'driving'],
    status: 'completed',
    isInstant: false,
    acceptsTeams: true,
    hasEscrow: true,
    hasInsurance: false,
    workplaceRating: 4.2,
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(),
    viewCount: 23,
  },
]

export default function MyShiftsPage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { myShifts, isLoadingShifts } = useEmployer()
  const { loadMyShifts, showToast } = useConnectorStore()

  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [displayShifts, setDisplayShifts] = useState<ShiftPosting[]>(mockShifts)

  useEffect(() => {
    loadMyShifts()
  }, [loadMyShifts])

  useEffect(() => {
    if (myShifts.length > 0) {
      setDisplayShifts(myShifts)
    }
  }, [myShifts])

  const filteredShifts = displayShifts.filter((shift) => {
    if (activeTab === 'all') return true
    if (activeTab === 'open') return shift.status === 'open' || shift.status === 'matched'
    if (activeTab === 'in_progress') return shift.status === 'in_progress'
    if (activeTab === 'completed') return shift.status === 'completed' || shift.status === 'cancelled'
    return true
  })

  const tabs: { id: TabFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All', icon: null },
    { id: 'open', label: 'Open', icon: <Clock className="w-4 h-4" /> },
    { id: 'in_progress', label: 'Active', icon: <Clock className="w-4 h-4" /> },
    { id: 'completed', label: 'Done', icon: <CheckCircle2 className="w-4 h-4" /> },
  ]

  return (
    <div
      className="min-h-screen bg-neutral-50 pb-20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Header
        title="My Shifts"
        showBack
        rightContent={
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.location.href = '/employer/create-shift'}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New
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
                'transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.id !== 'all' && (
                <span className={cn(
                  'ml-1 px-1.5 py-0.5 rounded-full text-xs',
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
              title="No shifts"
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
                      showToast('Link copied to clipboard', 'success')
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
