'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useEmployer, useConnectorStore } from '@/store'
import { Header, Navigation, EmptyState, LoadingState } from '@/components/shared'
import { ApplicantList } from '@/components/employer'
import type { TaskFlow, ShiftPosting } from '@/types'

// Mock shift for applications
const mockShift: ShiftPosting = {
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
}

// Mock applications
const mockApplications: TaskFlow[] = [
  {
    id: 'app1',
    shiftId: '1',
    shift: { ...mockShift, title: 'Warehouse Helper' },
    workerId: 'worker1',
    worker: {
      id: 'worker1',
      phone: '+972501111111',
      name: 'David Cohen',
      createdAt: new Date(),
      updatedAt: new Date(),
      language: 'he',
      isVerified: true,
      verificationStatus: 'verified',
      skills: ['warehouse', 'lifting'],
      availabilityStatus: 'available',
      rating: 4.9,
      reviewCount: 45,
      hourlyRate: 55,
      city: 'Tel Aviv',
      specialization: 'Warehouse',
      experience: 3,
      hasCar: true,
      hasTools: false,
      teamSize: 0,
      availability: 'now',
      minRate: 45,
      maxRate: 70,
      documents: [],
      portfolio: [],
      completedShifts: 67,
      totalEarned: 28500,
      totalHours: 520,
      reliabilityScore: 95,
      responseTime: 5,
      onTimeRate: 0.98,
      languages: ['Hebrew', 'English'],
      isPro: true,
    },
    status: 'applied',
    appliedAt: new Date(Date.now() - 3600000),
    agreedRate: 55,
    paymentStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'app2',
    shiftId: '2',
    shift: { ...mockShift, id: '2', title: 'Event Setup Crew' },
    workerId: 'worker2',
    worker: {
      id: 'worker2',
      phone: '+972502222222',
      name: 'Alex Ivanov',
      createdAt: new Date(),
      updatedAt: new Date(),
      language: 'ru',
      isVerified: true,
      verificationStatus: 'verified',
      skills: ['events', 'warehouse'],
      availabilityStatus: 'available',
      rating: 4.7,
      reviewCount: 28,
      hourlyRate: 50,
      city: 'Ramat Gan',
      specialization: 'Events',
      experience: 2,
      hasCar: false,
      hasTools: true,
      teamSize: 2,
      availability: 'today',
      minRate: 40,
      maxRate: 60,
      documents: [],
      portfolio: [],
      completedShifts: 34,
      totalEarned: 14200,
      totalHours: 280,
      reliabilityScore: 88,
      responseTime: 10,
      onTimeRate: 0.94,
      languages: ['Russian', 'Hebrew'],
      isPro: false,
    },
    status: 'applied',
    appliedAt: new Date(Date.now() - 7200000),
    agreedRate: 70,
    paymentStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'app3',
    shiftId: '1',
    shift: { ...mockShift, title: 'Warehouse Helper' },
    workerId: 'worker3',
    worker: {
      id: 'worker3',
      phone: '+972503333333',
      name: 'Sara Levi',
      createdAt: new Date(),
      updatedAt: new Date(),
      language: 'he',
      isVerified: false,
      verificationStatus: 'pending',
      skills: ['warehouse'],
      availabilityStatus: 'available',
      rating: 4.5,
      reviewCount: 12,
      hourlyRate: 45,
      city: 'Tel Aviv',
      specialization: 'General',
      experience: 1,
      hasCar: false,
      hasTools: false,
      teamSize: 0,
      availability: 'flexible',
      minRate: 40,
      maxRate: 55,
      documents: [],
      portfolio: [],
      completedShifts: 15,
      totalEarned: 6300,
      totalHours: 140,
      reliabilityScore: 82,
      responseTime: 15,
      onTimeRate: 0.90,
      languages: ['Hebrew'],
      isPro: false,
    },
    status: 'applied',
    appliedAt: new Date(Date.now() - 14400000),
    agreedRate: 55,
    paymentStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function AllApplicantsPage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { pendingApplications, isLoadingApplications } = useEmployer()
  const { approveApplication, rejectApplication, showToast } = useConnectorStore()

  const [applications, setApplications] = useState<TaskFlow[]>(mockApplications)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')

  useEffect(() => {
    const load = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setIsLoading(false)
    }
    load()
  }, [])

  const handleApprove = async (applicationId: string) => {
    try {
      await approveApplication(applicationId)
      setApplications(prev => prev.map(a =>
        a.id === applicationId ? { ...a, status: 'approved' as const } : a
      ))
      showToast('Worker approved!', 'success')
    } catch (error) {
      showToast('Failed to approve', 'error')
    }
  }

  const handleReject = async (applicationId: string) => {
    try {
      await rejectApplication(applicationId)
      setApplications(prev => prev.filter(a => a.id !== applicationId))
      showToast('Application rejected', 'info')
    } catch (error) {
      showToast('Failed to reject', 'error')
    }
  }

  const filteredApplications = applications.filter(a => {
    if (filter === 'pending') return a.status === 'applied' || a.status === 'reviewing'
    if (filter === 'approved') return a.status === 'approved'
    return true
  })

  // Group by shift
  const groupedByShift = filteredApplications.reduce((acc, app) => {
    const shiftTitle = app.shift.title
    if (!acc[shiftTitle]) {
      acc[shiftTitle] = []
    }
    acc[shiftTitle].push(app)
    return acc
  }, {} as Record<string, TaskFlow[]>)

  return (
    <div
      className="min-h-screen bg-neutral-50 pb-20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Header
        title="All Applicants"
        showBack
      />

      {/* Filter tabs */}
      <div className="px-4 py-3 bg-white border-b border-neutral-100">
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'flex-1 py-2 rounded-xl text-sm font-medium capitalize',
                'transition-all duration-200',
                filter === f
                  ? 'bg-brand-primary text-white'
                  : 'bg-neutral-100 text-neutral-600'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-4">
        {isLoading ? (
          <LoadingState variant="skeleton" />
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            type="no-applications"
            title="No applicants"
            subtitle="You'll see applicants here when people apply to your shifts"
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByShift).map(([shiftTitle, apps]) => (
              <section key={shiftTitle}>
                <h2 className="text-sm font-medium text-neutral-500 mb-3 px-1">
                  {shiftTitle} ({apps.length})
                </h2>
                <ApplicantList
                  applications={apps}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onContact={(id) => {
                    const app = applications.find(a => a.workerId === id || a.id === id)
                    if (app?.worker?.phone) {
                      window.open(`tel:${app.worker.phone}`, '_blank')
                    } else {
                      showToast('Contact info not available', 'warning')
                    }
                  }}
                  onViewProfile={(id) => router.push(`/worker/${id}`)}
                />
              </section>
            ))}
          </div>
        )}
      </main>

      <Navigation />
    </div>
  )
}
