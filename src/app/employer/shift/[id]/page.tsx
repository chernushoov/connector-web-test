'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useEmployer, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { Header, LoadingState, ErrorState } from '@/components/shared'
import { ApplicantList, ShiftManagement } from '@/components/employer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  MapPin,
  Clock,
  Calendar,
  Users,
  DollarSign,
  Edit2,
  Share2,
  Eye,
  TrendingUp
} from 'lucide-react'
import type { ShiftPosting, TaskFlow, WorkerProfile } from '@/types'

// Mock data
const mockShift: ShiftPosting = {
  id: '1',
  title: 'Warehouse Helper',
  description: 'Loading and unloading goods, organizing inventory. Must be able to lift heavy packages.',
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
  location: { latitude: 32.0853, longitude: 34.7818, address: 'Tel Aviv Port, Warehouse 7', distance: 2.3 },
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
  requiredSkills: ['warehouse', 'lifting'],
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

const mockApplications: TaskFlow[] = [
  {
    id: 'app1',
    shiftId: '1',
    shift: mockShift,
    workerId: 'worker1',
    worker: {
      id: 'worker1',
      phone: '+972501111111',
      name: 'David Cohen',
      photoUrl: undefined,
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
      languages: ['Hebrew', 'English', 'Russian'],
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
    shiftId: '1',
    shift: mockShift,
    workerId: 'worker2',
    worker: {
      id: 'worker2',
      phone: '+972502222222',
      name: 'Alex Ivanov',
      photoUrl: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      language: 'ru',
      isVerified: true,
      verificationStatus: 'verified',
      skills: ['warehouse', 'moving'],
      availabilityStatus: 'available',
      rating: 4.7,
      reviewCount: 28,
      hourlyRate: 50,
      city: 'Ramat Gan',
      specialization: 'Moving',
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
    agreedRate: 55,
    paymentStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'app3',
    shiftId: '1',
    shift: mockShift,
    workerId: 'worker3',
    worker: {
      id: 'worker3',
      phone: '+972503333333',
      name: 'Mohammad Hassan',
      photoUrl: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      language: 'ar',
      isVerified: false,
      verificationStatus: 'pending',
      skills: ['warehouse'],
      availabilityStatus: 'available',
      rating: 4.5,
      reviewCount: 12,
      hourlyRate: 45,
      city: 'Jaffa',
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
      languages: ['Arabic', 'Hebrew'],
      isPro: false,
    },
    status: 'approved',
    appliedAt: new Date(Date.now() - 86400000),
    approvedAt: new Date(Date.now() - 43200000),
    agreedRate: 55,
    paymentStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function ShiftManagePage() {
  const params = useParams()
  const router = useRouter()
  const shiftId = params.id as string

  const { language, isRTL } = useUI()
  const { pendingApplications, isLoadingApplications } = useEmployer()
  const { loadApplications, approveApplication, rejectApplication, showToast } = useConnectorStore()

  const [shift, setShift] = useState<ShiftPosting | null>(null)
  const [applications, setApplications] = useState<TaskFlow[]>(mockApplications)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'details' | 'applicants'>('applicants')

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      setShift({ ...mockShift, id: shiftId })
      await loadApplications(shiftId)
      setIsLoading(false)
    }
    loadData()
  }, [shiftId, loadApplications])

  const handleApprove = async (applicationId: string) => {
    try {
      await approveApplication(applicationId)
      setApplications(prev => prev.map(a =>
        a.id === applicationId ? { ...a, status: 'approved' as const } : a
      ))
    } catch (error) {
      showToast('Failed to approve', 'error')
    }
  }

  const handleReject = async (applicationId: string) => {
    try {
      await rejectApplication(applicationId)
      setApplications(prev => prev.filter(a => a.id !== applicationId))
    } catch (error) {
      showToast('Failed to reject', 'error')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header showBack title="Loading..." />
        <LoadingState fullScreen />
      </div>
    )
  }

  if (!shift) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header showBack title="Error" />
        <ErrorState
          type="generic"
          message="Shift not found"
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  const slotsLeft = shift.slots - shift.filled

  return (
    <div
      className="min-h-screen bg-neutral-50 pb-20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Header
        showBack
        title={shift.title}
        rightContent={
          <div className="flex gap-2">
            <Button variant="ghost" size="icon-sm">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon-sm">
              <Edit2 className="w-5 h-5" />
            </Button>
          </div>
        }
      />

      {/* Quick stats */}
      <div className="px-4 py-3 bg-white border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-neutral-600">
              <Eye className="w-4 h-4" />
              {shift.viewCount} views
            </span>
            <span className="flex items-center gap-1 text-neutral-600">
              <Users className="w-4 h-4" />
              {shift.applicants} applicants
            </span>
          </div>
          <Badge
            variant={slotsLeft <= 2 ? 'danger' : 'success'}
            size="sm"
          >
            {slotsLeft} spots left
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-3 bg-white border-b border-neutral-100">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('applicants')}
            className={cn(
              'flex-1 py-2 rounded-xl text-sm font-medium',
              'transition-all duration-200',
              activeTab === 'applicants'
                ? 'bg-brand-primary text-white'
                : 'bg-neutral-100 text-neutral-600'
            )}
          >
            Applicants ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={cn(
              'flex-1 py-2 rounded-xl text-sm font-medium',
              'transition-all duration-200',
              activeTab === 'details'
                ? 'bg-brand-primary text-white'
                : 'bg-neutral-100 text-neutral-600'
            )}
          >
            Shift Details
          </button>
        </div>
      </div>

      <main className="px-4 py-4">
        {activeTab === 'applicants' ? (
          <ApplicantList
            applications={applications}
            isLoading={isLoadingApplications}
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
        ) : (
          <div className="space-y-4">
            {/* Shift details */}
            <Card>
              <h3 className="font-semibold text-neutral-900 mb-3">Description</h3>
              <p className="text-neutral-600">{shift.description}</p>
            </Card>

            <Card>
              <h3 className="font-semibold text-neutral-900 mb-3">Details</h3>
              <div className="space-y-3">
                <DetailRow
                  icon={<MapPin className="w-5 h-5" />}
                  label="Location"
                  value={shift.location.address || shift.city}
                />
                <DetailRow
                  icon={<Calendar className="w-5 h-5" />}
                  label="Date"
                  value={new Date(shift.date).toLocaleDateString()}
                />
                <DetailRow
                  icon={<Clock className="w-5 h-5" />}
                  label="Time"
                  value={`${shift.startTime} - ${shift.endTime}`}
                />
                <DetailRow
                  icon={<DollarSign className="w-5 h-5" />}
                  label="Rate"
                  value={`₪${shift.baseRate}/hr`}
                />
                <DetailRow
                  icon={<Users className="w-5 h-5" />}
                  label="Workers"
                  value={`${shift.filled}/${shift.slots} filled`}
                />
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="ghost" fullWidth>
                Cancel Shift
              </Button>
              <Button variant="primary" fullWidth>
                Edit Shift
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-neutral-400">{icon}</span>
      <div className="flex-1">
        <p className="text-sm text-neutral-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}
