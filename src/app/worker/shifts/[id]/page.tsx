'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useUI, useConnectorStore } from '@/store'
import { Header, LoadingState, ErrorState } from '@/components/shared'
import { ShiftDetail } from '@/components/worker'
import type { ShiftPosting } from '@/types'

// Mock shift data - in production, fetch from API
const mockShift: ShiftPosting = {
  id: '1',
  title: 'Warehouse Helper',
  description: 'Loading and unloading goods, organizing inventory. Must be able to lift heavy packages and work in a fast-paced environment.',
  employer: {
    id: 'emp1',
    name: 'Alex Cohen',
    company: 'FastLogistics Ltd',
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
  surgeMultiplier: 1.2,
  totalEstimate: 528,
  paymentGuarantee: true,
  slots: 5,
  filled: 3,
  applicants: 12,
  requirements: { needsCar: false, needsTools: false, needsTeam: 0, minExperience: 0, minRating: 3.5 },
  requiredSkills: ['warehouse', 'lifting'],
  status: 'open',
  isInstant: true,
  acceptsTeams: true,
  hasEscrow: true,
  hasInsurance: true,
  workplaceRating: 4.5,
  createdAt: new Date(),
  updatedAt: new Date(),
  viewCount: 45,
}

export default function ShiftDetailPage() {
  const params = useParams()
  const shiftId = params.id as string

  const { language, isRTL } = useUI()
  const [shift, setShift] = useState<ShiftPosting | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Simulate API call
    const loadShift = async () => {
      try {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 500))

        // In production, fetch shift by ID
        setShift({ ...mockShift, id: shiftId })
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    loadShift()
  }, [shiftId])

  const handleApply = () => {
    window.location.href = '/worker/my-tasks'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header showBack title="Loading..." />
        <LoadingState fullScreen />
      </div>
    )
  }

  if (error || !shift) {
    return (
      <div className="min-h-screen bg-white">
        <Header showBack title="Error" />
        <ErrorState
          type="generic"
          message="Could not load shift details"
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header
        showBack
        transparent
      />
      <ShiftDetail
        shift={shift}
        onApply={handleApply}
      />
    </div>
  )
}
