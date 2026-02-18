'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useEmployer, useConnectorStore } from '@/store'
import { Header, Navigation, EmptyState, ErrorState, LoadingState } from '@/components/shared'
import { t } from '@/i18n/translations'
import { ApplicantList } from '@/components/employer'
import type { TaskFlow, Language } from '@/types'

export default function AllApplicantsPage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { pendingApplications, isLoadingApplications } = useEmployer()
  const { approveApplication, rejectApplication, showToast } = useConnectorStore()

  const [applications, setApplications] = useState<TaskFlow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')

  const fetchApplications = useCallback(async () => {
    setIsLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/applications')
      if (res.ok) {
        const data = await res.json()
        setApplications(data.applications || [])
      }
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const handleApprove = async (applicationId: string) => {
    try {
      await approveApplication(applicationId)
      setApplications(prev => prev.map(a =>
        a.id === applicationId ? { ...a, status: 'approved' as const } : a
      ))
      showToast(t('toast.workerApproved', language as Language), 'success')
    } catch (error) {
      showToast(t('toast.failedApprove', language as Language), 'error')
    }
  }

  const handleReject = async (applicationId: string) => {
    try {
      await rejectApplication(applicationId)
      setApplications(prev => prev.filter(a => a.id !== applicationId))
      showToast(t('toast.applicationRejected', language as Language), 'info')
    } catch (error) {
      showToast(t('toast.failedReject', language as Language), 'error')
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
        title={t('page.applicants', language as Language)}
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
                'flex-1 py-2 rounded-xl text-sm font-medium',
                'transition-all duration-200',
                filter === f
                  ? 'bg-brand-primary text-white'
                  : 'bg-neutral-100 text-neutral-600'
              )}
            >
              {f === 'all' ? t('tabs.all', language as Language) : f === 'pending' ? t('tabs.pending', language as Language) : t('tabs.approved', language as Language)}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-4">
        {isLoading ? (
          <LoadingState variant="skeleton" />
        ) : error ? (
          <ErrorState type="network" onRetry={fetchApplications} />
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            type="no-applications"
            title={t('empty.noApplicants', language as Language)}
            subtitle={t('empty.noApplicants.subtitle', language as Language)}
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
                      showToast(t('toast.contactNotAvailable', language as Language), 'warning')
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
