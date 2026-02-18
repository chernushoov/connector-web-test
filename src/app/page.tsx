'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useConnectorStore, useUI, useFreeWorld, useAuth } from '@/store'
import {
  FreeWorldMap,
  MapLegend,
  WorkerCard,
  WorkerList,
  TaskCard,
  TaskList,
  AvailabilityToggle,
  QuickRegistrationModal,
} from '@/components/free-world'
import { WelcomeScreen, Navigation, OnboardingSlides, InteractiveTour } from '@/components/shared'
import { Button, IconButton } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/Input'
import { BottomSheet, BottomSheetContent } from '@/components/ui/BottomSheet'
import { t } from '@/i18n/translations'
import type { MapMarker, QuickProfile, QuickTask, Language } from '@/types'

// ============================================
// HOME PAGE COMPONENT
// ============================================

export default function HomePage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { isAuthenticated } = useAuth()
  const { isAvailable } = useFreeWorld()
  const requestLocation = useConnectorStore((state) => state.requestLocation)
  const toggleAvailability = useConnectorStore((state) => state.toggleAvailability)

  const [onboardingPhase, setOnboardingPhase] = useState<'welcome' | 'slides' | 'tour' | 'complete'>('welcome')
  const [showRegistration, setShowRegistration] = useState(false)
  const [activeTab, setActiveTab] = useState<'map' | 'workers' | 'tasks'>('map')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)

  const [workers, setWorkers] = useState<QuickProfile[]>([])
  const [tasks, setTasks] = useState<QuickTask[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user has completed onboarding
  useEffect(() => {
    const hasCompletedOnboarding = sessionStorage.getItem('connector_onboarding_complete')
    if (hasCompletedOnboarding) {
      setOnboardingPhase('complete')
    }
  }, [])

  const handleWelcomeComplete = useCallback(() => {
    setOnboardingPhase('slides')
  }, [])

  const handleSlidesComplete = useCallback((startTour: boolean) => {
    if (startTour) {
      setOnboardingPhase('tour')
    } else {
      sessionStorage.setItem('connector_onboarding_complete', 'true')
      setOnboardingPhase('complete')
      setShowRegistration(true)
    }
  }, [])

  const handleTourComplete = useCallback(() => {
    sessionStorage.setItem('connector_onboarding_complete', 'true')
    setOnboardingPhase('complete')
    setShowRegistration(true)
  }, [])

  // Request location when onboarding is complete
  useEffect(() => {
    if (onboardingPhase === 'complete' || onboardingPhase === 'tour') {
      requestLocation()
    }
  }, [requestLocation, onboardingPhase])

  // Fetch workers and tasks from API
  useEffect(() => {
    if (onboardingPhase !== 'complete' && onboardingPhase !== 'tour') return

    async function fetchData() {
      setIsLoadingData(true)
      setError(null)
      try {
        const [workersRes, shiftsRes] = await Promise.all([
          fetch('/api/shifts/nearby?limit=30').catch(() => null),
          fetch('/api/shifts?status=active&limit=30').catch(() => null),
        ])

        if (workersRes?.ok) {
          const data = await workersRes.json()
          // Map nearby shifts to extract worker-like profiles if available
          if (data.workers) {
            setWorkers(data.workers)
          }
        }

        if (shiftsRes?.ok) {
          const data = await shiftsRes.json()
          setTasks(
            (data.shifts || []).map((s: Record<string, unknown>) => ({
              id: s.id,
              title: s.title,
              description: s.description,
              creator: {
                id: (s as Record<string, unknown>).employer_id || '',
                name: (s as Record<string, unknown>).employer_name || '',
                phone: '',
                isVerified: true,
              },
              location: s.location || { latitude: 32.0853, longitude: 34.7818 },
              when: s.urgency === 'instant' ? 'now' : s.urgency === 'today' ? 'today' : 'tomorrow',
              duration: 2,
              amount: (s as Record<string, unknown>).totalEstimate || (s as Record<string, unknown>).baseRate || 0,
              isNegotiable: false,
              status: 'open',
              createdAt: new Date(s.createdAt as string),
              viewCount: (s as Record<string, unknown>).viewCount || 0,
              responseCount: (s as Record<string, unknown>).applicants || 0,
            }))
          )
        }
      } catch {
        setError(t('freeworld.failedLoad', language as Language))
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [onboardingPhase])

  // Create markers from workers and tasks
  const markers: MapMarker[] = useMemo(() => [
    ...workers.map((w: QuickProfile) => ({
      id: w.id,
      type: 'worker' as const,
      coordinates: w.location!,
      data: w,
      isAvailable: w.availabilityStatus === 'available',
      isPro: (w.rating ?? 0) >= 4.8,
    })),
    ...tasks.map((t: QuickTask) => ({
      id: t.id,
      type: 'task' as const,
      coordinates: t.location!,
      data: t,
      isUrgent: t.when === 'now',
    })),
  ], [workers, tasks])

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker)
  }

  // Show onboarding screens
  if (onboardingPhase === 'welcome') {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />
  }

  if (onboardingPhase === 'slides') {
    return <OnboardingSlides onComplete={handleSlidesComplete} />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn('min-h-screen bg-neutral-50', isRTL && 'rtl')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-lg border-b border-neutral-100">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-lg text-neutral-900">Connector</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Availability toggle (mini) */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleAvailability}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                    isAvailable
                      ? 'bg-success text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  )}
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      isAvailable ? 'bg-white animate-pulse' : 'bg-neutral-400'
                    )}
                  />
                  {isAvailable ? t('freeworld.online', language as Language) : t('freeworld.offline', language as Language)}
                </motion.button>

                {/* Profile */}
                <IconButton
                  variant="ghost"
                  aria-label="Profile"
                  onClick={() => router.push('/profile')}
                  icon={
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  }
                />
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowRegistration(true)}
              >
                {t('freeworld.joinFree', language as Language)}
              </Button>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3" id="search-bar">
          <SearchInput
            placeholder={t('search.placeholder', language as Language)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="flex border-t border-neutral-100" id="tab-bar">
          {[
            { id: 'map', label: t('tabs.map', language as Language), icon: '🗺️' },
            { id: 'workers', label: t('tabs.workers', language as Language), icon: '👷' },
            { id: 'tasks', label: t('tabs.tasks', language as Language), icon: '📋' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium',
                'border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              )}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className="pt-[156px] pb-24">
        <AnimatePresence mode="wait">
          {/* Map view */}
          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-[156px] bottom-24"
              id="map-view"
            >
              <FreeWorldMap
                markers={markers}
                center={{ latitude: 32.0853, longitude: 34.7818 }}
                zoom={14}
                onMarkerClick={handleMarkerClick}
                showUserLocation
              />

              {/* Map legend */}
              <MapLegend className="absolute bottom-4 start-4" />

              {/* Floating action button */}
              {!isAuthenticated && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute bottom-4 end-4"
                >
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setShowRegistration(true)}
                    className="shadow-lg"
                    glow
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                    {t('freeworld.showOnMap', language as Language)}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Workers list */}
          {activeTab === 'workers' && (
            <motion.div
              key="workers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-4 py-4"
            >
              {/* Stats banner */}
              <div className="bg-gradient-brand rounded-2xl p-4 mb-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{t('freeworld.available.now', language as Language)}</p>
                    <p className="text-2xl font-bold">
                      {workers.filter((w: QuickProfile) => w.availabilityStatus === 'available').length} {t('tabs.workers', language as Language).toLowerCase()}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="text-white/80 text-sm">{t('freeworld.avgRate', language as Language)}</p>
                    <p className="text-2xl font-bold">₪{workers.length > 0 ? Math.round(workers.reduce((sum: number, w: QuickProfile) => sum + (w.hourlyRate || 0), 0) / workers.length) : 0}/h</p>
                  </div>
                </div>
              </div>

              {/* Worker list */}
              <WorkerList
                workers={workers}
                title={t('freeworld.nearbyWorkers', language as Language)}
                onWorkerClick={(worker) => {
                  setSelectedMarker({
                    id: worker.id,
                    type: 'worker',
                    coordinates: worker.location!,
                    data: worker,
                    isAvailable: worker.availabilityStatus === 'available',
                    isPro: worker.rating >= 4.8,
                  })
                }}
              />
            </motion.div>
          )}

          {/* Tasks list */}
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-4 py-4"
            >
              {/* Urgent tasks */}
              {tasks.some((t: QuickTask) => t.when === 'now') && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 bg-danger rounded-full animate-pulse" />
                    <h2 className="font-semibold text-danger">{t('freeworld.tasks.urgent', language as Language)}</h2>
                  </div>
                  <div className="space-y-3">
                    {tasks
                      .filter((t: QuickTask) => t.when === 'now')
                      .map((task: QuickTask) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          variant="featured"
                          onRespond={() => {
                            if (!isAuthenticated) {
                              setShowRegistration(true)
                            }
                          }}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* All tasks */}
              <TaskList
                tasks={tasks.filter((t: QuickTask) => t.when !== 'now')}
                title={t('freeworld.availableTasks', language as Language)}
                onTaskClick={(task) => {
                  setSelectedMarker({
                    id: task.id,
                    type: 'task',
                    coordinates: task.location!,
                    data: task,
                    isUrgent: task.when === 'now',
                  })
                }}
                onRespond={() => {
                  if (!isAuthenticated) {
                    setShowRegistration(true)
                  }
                }}
              />

              {/* Psychology: potential earnings */}
              <div className="mt-6 p-4 bg-brand-accent/20 rounded-2xl">
                <p className="text-sm text-neutral-600">
                  💰 {t('freeworld.tasksToday', language as Language)}
                </p>
                <p className="text-2xl font-bold text-neutral-900">₪4,250</p>
                <p className="text-xs text-neutral-500 mt-1">
                  {t('freeworld.couldBeEarning', language as Language)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom navigation */}
      <Navigation />

      {/* Availability toggle floating button (for authenticated users) */}
      {isAuthenticated && (
        <div className="fixed bottom-24 left-4 right-4 z-20">
          <AvailabilityToggle />
        </div>
      )}

      {/* Quick registration modal */}
      <QuickRegistrationModal
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        lang={language}
      />

      {/* Selected marker detail sheet */}
      <BottomSheet
        isOpen={selectedMarker !== null}
        onClose={() => setSelectedMarker(null)}
      >
        <BottomSheetContent>
          {selectedMarker?.type === 'worker' && (
            <WorkerCard
              worker={selectedMarker.data as QuickProfile}
              showActions
            />
          )}
          {selectedMarker?.type === 'task' && (
            <TaskCard
              task={selectedMarker.data as QuickTask}
              onRespond={() => {
                if (!isAuthenticated) {
                  setShowRegistration(true)
                }
                setSelectedMarker(null)
              }}
            />
          )}
        </BottomSheetContent>
      </BottomSheet>

      {/* Interactive tour overlay */}
      {onboardingPhase === 'tour' && (
        <InteractiveTour onComplete={handleTourComplete} />
      )}
    </motion.div>
  )
}
