'use client'

import { useState, useEffect, useCallback } from 'react'
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
import type { MapMarker, QuickProfile, QuickTask } from '@/types'

// ============================================
// MOCK DATA (Replace with API)
// ============================================

const mockWorkers: QuickProfile[] = [
  {
    id: '1',
    phone: '+972501234567',
    name: 'Dmitry K.',
    photoUrl: undefined,
    skills: ['Construction', 'Repair', 'Moving'],
    availabilityStatus: 'available',
    rating: 4.8,
    reviewCount: 24,
    hourlyRate: 60,
    location: { latitude: 32.0853, longitude: 34.7818, city: 'Tel Aviv' },
    createdAt: new Date(),
    updatedAt: new Date(),
    language: 'ru',
    isVerified: true,
    verificationStatus: 'verified',
  },
  {
    id: '2',
    phone: '+972502345678',
    name: 'Maria S.',
    photoUrl: undefined,
    skills: ['Cleaning', 'Cooking'],
    availabilityStatus: 'available',
    rating: 4.9,
    reviewCount: 31,
    hourlyRate: 50,
    location: { latitude: 32.0873, longitude: 34.7838, city: 'Tel Aviv' },
    createdAt: new Date(),
    updatedAt: new Date(),
    language: 'ru',
    isVerified: true,
    verificationStatus: 'verified',
  },
  {
    id: '3',
    phone: '+972503456789',
    name: 'Alex M.',
    photoUrl: undefined,
    skills: ['Delivery', 'Driving'],
    availabilityStatus: 'busy',
    rating: 4.5,
    reviewCount: 12,
    hourlyRate: 45,
    location: { latitude: 32.0833, longitude: 34.7798, city: 'Tel Aviv' },
    createdAt: new Date(),
    updatedAt: new Date(),
    language: 'ru',
    isVerified: false,
    verificationStatus: 'pending',
  },
]

const mockTasks: QuickTask[] = [
  {
    id: 't1',
    title: 'Help move furniture',
    description: 'Need 2 people to help move a sofa and wardrobe from 3rd floor',
    creator: {
      id: 'c1',
      name: 'Yosef B.',
      phone: '+972504567890',
      isVerified: true,
    },
    location: { latitude: 32.0863, longitude: 34.7828, city: 'Tel Aviv' },
    when: 'now',
    duration: 2,
    amount: 400,
    isNegotiable: false,
    status: 'open',
    createdAt: new Date(),
    viewCount: 15,
    responseCount: 3,
  },
  {
    id: 't2',
    title: 'Clean apartment after renovation',
    description: 'Deep cleaning needed after construction work',
    creator: {
      id: 'c2',
      name: 'Anna R.',
      phone: '+972505678901',
      isVerified: true,
    },
    location: { latitude: 32.0843, longitude: 34.7808, city: 'Tel Aviv' },
    when: 'today',
    duration: 4,
    amount: 600,
    isNegotiable: true,
    status: 'open',
    createdAt: new Date(),
    viewCount: 8,
    responseCount: 1,
  },
]

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

  // Check if user has completed onboarding
  // ВРЕМЕННО ОТКЛЮЧЕНО для тестирования - Welcome Screen будет показываться всегда
  // useEffect(() => {
  //   const hasCompletedOnboarding = sessionStorage.getItem('connector_onboarding_complete')
  //   if (hasCompletedOnboarding) {
  //     setOnboardingPhase('complete')
  //   }
  // }, [])

  const handleWelcomeComplete = useCallback(() => {
    setOnboardingPhase('slides')
  }, [])

  const handleSlidesComplete = useCallback((startTour: boolean) => {
    if (startTour) {
      setOnboardingPhase('tour')
    } else {
      // sessionStorage.setItem('connector_onboarding_complete', 'true')
      setOnboardingPhase('complete')
      setShowRegistration(true)
    }
  }, [])

  const handleTourComplete = useCallback(() => {
    // sessionStorage.setItem('connector_onboarding_complete', 'true')
    setOnboardingPhase('complete')
    setShowRegistration(true)
  }, [])

  // Request location when onboarding is complete
  useEffect(() => {
    if (onboardingPhase === 'complete' || onboardingPhase === 'tour') {
      requestLocation()
    }
  }, [requestLocation, onboardingPhase])

  // Create markers from workers and tasks
  const markers: MapMarker[] = [
    ...mockWorkers.map((w) => ({
      id: w.id,
      type: 'worker' as const,
      coordinates: w.location!,
      data: w,
      isAvailable: w.availabilityStatus === 'available',
      isPro: w.rating >= 4.8,
    })),
    ...mockTasks.map((t) => ({
      id: t.id,
      type: 'task' as const,
      coordinates: t.location!,
      data: t,
      isUrgent: t.when === 'now',
    })),
  ]

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
                  {isAvailable ? 'Online' : 'Offline'}
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
                Join Free
              </Button>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3" id="search-bar">
          <SearchInput
            placeholder="Search workers, tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="flex border-t border-neutral-100" id="tab-bar">
          {[
            { id: 'map', label: 'Map', icon: '🗺️' },
            { id: 'workers', label: 'Workers', icon: '👷' },
            { id: 'tasks', label: 'Tasks', icon: '📋' },
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
              <MapLegend className="absolute bottom-4 left-4" />

              {/* Floating action button */}
              {!isAuthenticated && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute bottom-4 right-4"
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
                    Show me on map
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
                    <p className="text-white/80 text-sm">Available now</p>
                    <p className="text-2xl font-bold">
                      {mockWorkers.filter((w) => w.availabilityStatus === 'available').length} workers
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-sm">Avg. rate</p>
                    <p className="text-2xl font-bold">₪52/h</p>
                  </div>
                </div>
              </div>

              {/* Worker list */}
              <WorkerList
                workers={mockWorkers}
                title="Nearby Workers"
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
              {mockTasks.some((t) => t.when === 'now') && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 bg-danger rounded-full animate-pulse" />
                    <h2 className="font-semibold text-danger">Urgent Tasks</h2>
                  </div>
                  <div className="space-y-3">
                    {mockTasks
                      .filter((t) => t.when === 'now')
                      .map((task) => (
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
                tasks={mockTasks.filter((t) => t.when !== 'now')}
                title="Available Tasks"
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
                  💰 Tasks completed today in your area
                </p>
                <p className="text-2xl font-bold text-neutral-900">₪4,250</p>
                <p className="text-xs text-neutral-500 mt-1">
                  You could be earning this too!
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
