// ============================================
// CONNECTOR 2.0 - Zustand Store
// ============================================

import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  Language,
  UserMode,
  AvailabilityStatus,
  WorkerAvailability,
  DayFilter,
  Coordinates,
  Location,
  QuickProfile,
  WorkerProfile,
  EmployerProfile,
  ShiftPosting,
  QuickTask,
  TaskFlow,
  FilterState,
  MapRegion,
  Notification,
  TrialStatus,
  UserSubscriptionState,
  SubscriptionPlan,
  PricingPlan,
} from '@/types'

// ============================================
// STATE INTERFACES
// ============================================

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  phone: string | null
  verificationCode: string | null
  userId: string | null
}

interface UserState {
  mode: UserMode
  quickProfile: QuickProfile | null
  workerProfile: WorkerProfile | null
  employerProfile: EmployerProfile | null
  currentLocation: Location | null
  isLocationLoading: boolean
  locationError: string | null
}

interface FreeWorldState {
  // My availability
  isAvailable: boolean
  availableUntil: Date | null
  availabilityStatus: AvailabilityStatus

  // Nearby data
  nearbyWorkers: QuickProfile[]
  nearbyTasks: QuickTask[]
  isLoadingNearby: boolean

  // Map state
  mapRegion: MapRegion
  selectedMarkerId: string | null

  // Quick registration
  isQuickRegistering: boolean
  quickRegistrationStep: number
}

interface WorkerState {
  // Feed
  shifts: ShiftPosting[]
  recommendedShifts: ShiftPosting[]
  isLoadingShifts: boolean

  // My tasks
  myTasks: TaskFlow[]
  activeTask: TaskFlow | null
  isLoadingTasks: boolean

  // Filters
  filters: FilterState

  // Statistics
  totalEarned: number
  completedShifts: number
  upcomingShifts: number
}

interface EmployerState {
  // My shifts
  myShifts: ShiftPosting[]
  activeShift: ShiftPosting | null
  isLoadingShifts: boolean

  // Applications
  pendingApplications: TaskFlow[]
  approvedWorkers: TaskFlow[]
  isLoadingApplications: boolean

  // Statistics
  totalPaid: number
  activeWorkers: number
  shiftsThisMonth: number
}

interface UIState {
  language: Language
  isRTL: boolean
  theme: 'light' | 'dark'

  // Modals
  isFilterModalOpen: boolean
  isProfileModalOpen: boolean
  isShiftDetailOpen: boolean
  isWorkerDetailOpen: boolean
  selectedShiftId: string | null
  selectedWorkerId: string | null

  // Bottom sheets
  activeBottomSheet: 'none' | 'apply' | 'create-task' | 'availability' | 'filters'

  // Notifications
  notifications: Notification[]
  unreadCount: number

  // Search
  searchQuery: string
  searchResults: (ShiftPosting | QuickProfile | QuickTask)[]
  isSearching: boolean

  // Toast
  toast: {
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    isVisible: boolean
  }
}

interface SubscriptionState {
  // Current status
  subscriptionState: UserSubscriptionState
  currentPlan: SubscriptionPlan

  // Trial info
  trialStatus: TrialStatus
  trialStartedAt: Date | null
  trialEndsAt: Date | null

  // Stats during trial
  trialStats: {
    earnings: number
    shiftsCompleted: number
    applicationsApproved: number
    profileViews: number
    agencySavings: number
  }

  // Modals
  showTrialEndModal: boolean
  showPricingModal: boolean
}

// ============================================
// COMBINED STORE STATE
// ============================================

interface ConnectorStore {
  // States
  auth: AuthState
  user: UserState
  freeWorld: FreeWorldState
  worker: WorkerState
  employer: EmployerState
  ui: UIState
  subscription: SubscriptionState

  // Auth actions
  setPhone: (phone: string) => void
  setVerificationCode: (code: string) => void
  login: () => Promise<void>
  logout: () => void

  // User actions
  setMode: (mode: UserMode) => void
  updateQuickProfile: (profile: Partial<QuickProfile>) => void
  updateWorkerProfile: (profile: Partial<WorkerProfile>) => void
  updateEmployerProfile: (profile: Partial<EmployerProfile>) => void
  setCurrentLocation: (location: Location) => void
  requestLocation: () => Promise<void>

  // Free World actions
  toggleAvailability: () => void
  setAvailableUntil: (date: Date | null) => void
  setAvailabilityStatus: (status: AvailabilityStatus) => void
  loadNearbyWorkers: () => Promise<void>
  loadNearbyTasks: () => Promise<void>
  setMapRegion: (region: MapRegion) => void
  selectMarker: (id: string | null) => void
  startQuickRegistration: () => void
  nextQuickRegistrationStep: () => void
  finishQuickRegistration: (profile: QuickProfile) => void

  // Worker actions
  loadShifts: () => Promise<void>
  loadRecommendedShifts: () => Promise<void>
  loadMyTasks: () => Promise<void>
  applyToShift: (shiftId: string, message?: string) => Promise<void>
  cancelApplication: (taskFlowId: string) => Promise<void>
  setWorkerFilters: (filters: Partial<FilterState>) => void
  resetWorkerFilters: () => void

  // Employer actions
  loadMyShifts: () => Promise<void>
  createShift: (shift: Omit<ShiftPosting, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateShift: (shiftId: string, updates: Partial<ShiftPosting>) => Promise<void>
  deleteShift: (shiftId: string) => Promise<void>
  loadApplications: (shiftId: string) => Promise<void>
  approveApplication: (taskFlowId: string) => Promise<void>
  rejectApplication: (taskFlowId: string) => Promise<void>

  // UI actions
  setLanguage: (lang: Language) => void
  toggleTheme: () => void
  openFilterModal: () => void
  closeFilterModal: () => void
  openProfileModal: () => void
  closeProfileModal: () => void
  openShiftDetail: (shiftId: string) => void
  closeShiftDetail: () => void
  openWorkerDetail: (workerId: string) => void
  closeWorkerDetail: () => void
  setBottomSheet: (sheet: UIState['activeBottomSheet']) => void
  setSearchQuery: (query: string) => void
  search: () => Promise<void>
  showToast: (message: string, type: UIState['toast']['type']) => void
  hideToast: () => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void

  // Subscription actions
  startTrial: () => void
  checkTrialStatus: () => void
  subscribe: (plan: SubscriptionPlan) => Promise<void>
  cancelSubscription: () => Promise<void>
  openTrialEndModal: () => void
  closeTrialEndModal: () => void
  openPricingModal: () => void
  closePricingModal: () => void
  updateTrialStats: (stats: Partial<SubscriptionState['trialStats']>) => void
  getTrialDaysRemaining: () => number
  getTrialHoursRemaining: () => number
}

// ============================================
// DEFAULT STATES
// ============================================

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  phone: null,
  verificationCode: null,
  userId: null,
}

const defaultUserState: UserState = {
  mode: 'free-world',
  quickProfile: null,
  workerProfile: null,
  employerProfile: null,
  currentLocation: null,
  isLocationLoading: false,
  locationError: null,
}

const defaultFreeWorldState: FreeWorldState = {
  isAvailable: false,
  availableUntil: null,
  availabilityStatus: 'offline',
  nearbyWorkers: [],
  nearbyTasks: [],
  isLoadingNearby: false,
  mapRegion: {
    center: { latitude: 32.0853, longitude: 34.7818 }, // Tel Aviv
    zoom: 13,
  },
  selectedMarkerId: null,
  isQuickRegistering: false,
  quickRegistrationStep: 0,
}

const defaultFilterState: FilterState = {
  search: '',
  day: 'all',
  maxDistance: 50,
  minRate: undefined,
  maxRate: undefined,
  instantOnly: false,
  teamsOnly: false,
  verifiedOnly: false,
  skills: undefined,
  urgency: undefined,
}

const defaultWorkerState: WorkerState = {
  shifts: [],
  recommendedShifts: [],
  isLoadingShifts: false,
  myTasks: [],
  activeTask: null,
  isLoadingTasks: false,
  filters: defaultFilterState,
  // Demo statistics - will be replaced with real API data
  totalEarned: 28500,
  completedShifts: 67,
  upcomingShifts: 3,
}

const defaultEmployerState: EmployerState = {
  myShifts: [],
  activeShift: null,
  isLoadingShifts: false,
  pendingApplications: [],
  approvedWorkers: [],
  isLoadingApplications: false,
  // Demo statistics - will be replaced with real API data
  totalPaid: 125000,
  activeWorkers: 7,
  shiftsThisMonth: 12,
}

const defaultUIState: UIState = {
  language: 'ru',
  isRTL: false,
  theme: 'light',
  isFilterModalOpen: false,
  isProfileModalOpen: false,
  isShiftDetailOpen: false,
  isWorkerDetailOpen: false,
  selectedShiftId: null,
  selectedWorkerId: null,
  activeBottomSheet: 'none',
  notifications: [],
  unreadCount: 0,
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  toast: {
    message: '',
    type: 'info',
    isVisible: false,
  },
}

const defaultSubscriptionState: SubscriptionState = {
  subscriptionState: 'anonymous',
  currentPlan: 'free',
  trialStatus: 'not_started',
  trialStartedAt: null,
  trialEndsAt: null,
  trialStats: {
    earnings: 0,
    shiftsCompleted: 0,
    applicationsApproved: 0,
    profileViews: 0,
    agencySavings: 0,
  },
  showTrialEndModal: false,
  showPricingModal: false,
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useConnectorStore = create<ConnectorStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial states
        auth: defaultAuthState,
        user: defaultUserState,
        freeWorld: defaultFreeWorldState,
        worker: defaultWorkerState,
        employer: defaultEmployerState,
        ui: defaultUIState,
        subscription: defaultSubscriptionState,

        // ========================================
        // AUTH ACTIONS
        // ========================================

        setPhone: (phone) =>
          set((state) => {
            state.auth.phone = phone
          }),

        setVerificationCode: (code) =>
          set((state) => {
            state.auth.verificationCode = code
          }),

        login: async () => {
          const { phone, verificationCode } = get().auth
          if (!phone || !verificationCode) return

          set((state) => {
            state.auth.isLoading = true
          })

          try {
            const res = await fetch('/api/auth/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone, code: verificationCode }),
            })

            if (!res.ok) {
              const err = await res.json()
              throw new Error(err.error || 'Verification failed')
            }

            const data = await res.json()

            set((state) => {
              state.auth.isAuthenticated = true
              state.auth.isLoading = false
              state.auth.userId = data.user?.id || null
            })

            // Load user profile after login
            const profileRes = await fetch('/api/users/me')
            if (profileRes.ok) {
              const profile = await profileRes.json()
              set((state) => {
                if (profile.user_type === 'worker') {
                  state.user.mode = 'worker'
                  state.user.workerProfile = profile.worker_profile
                } else if (profile.user_type === 'employer') {
                  state.user.mode = 'employer'
                  state.user.employerProfile = profile.employer_profile
                }
                state.user.quickProfile = {
                  id: profile.id,
                  name: profile.full_name || '',
                  avatar: profile.avatar_url || '',
                  rating: profile.rating || 0,
                  isVerified: profile.is_verified || false,
                  skills: profile.skills || [],
                  availabilityStatus: 'offline',
                  reviewCount: profile.review_count || 0,
                  phone: profile.phone || '',
                  location: profile.location || null,
                  completedTasks: profile.completed_tasks || 0,
                  memberSince: profile.created_at || new Date().toISOString(),
                  responseTime: profile.response_time || 0,
                  createdAt: profile.created_at || new Date(),
                  updatedAt: profile.updated_at || new Date(),
                  language: profile.language || 'ru',
                  verificationStatus: profile.verification_status || 'unverified',
                } as QuickProfile
              })
            }
          } catch (error) {
            set((state) => {
              state.auth.isLoading = false
            })
            throw error
          }
        },

        logout: async () => {
          try {
            await fetch('/api/auth/logout', { method: 'POST' })
          } catch {
            // proceed with local cleanup even if API fails
          }
          set((state) => {
            state.auth = defaultAuthState
            state.user = defaultUserState
            state.freeWorld = defaultFreeWorldState
            state.worker = defaultWorkerState
            state.employer = defaultEmployerState
          })
        },

        // ========================================
        // USER ACTIONS
        // ========================================

        setMode: (mode) =>
          set((state) => {
            state.user.mode = mode
          }),

        updateQuickProfile: (profile) =>
          set((state) => {
            if (state.user.quickProfile) {
              Object.assign(state.user.quickProfile, profile)
            } else {
              state.user.quickProfile = profile as QuickProfile
            }
          }),

        updateWorkerProfile: (profile) =>
          set((state) => {
            if (state.user.workerProfile) {
              Object.assign(state.user.workerProfile, profile)
            } else {
              state.user.workerProfile = profile as WorkerProfile
            }
          }),

        updateEmployerProfile: (profile) =>
          set((state) => {
            if (state.user.employerProfile) {
              Object.assign(state.user.employerProfile, profile)
            } else {
              state.user.employerProfile = profile as EmployerProfile
            }
          }),

        setCurrentLocation: (location) =>
          set((state) => {
            state.user.currentLocation = location
            state.user.isLocationLoading = false
            state.user.locationError = null
          }),

        requestLocation: async () => {
          set((state) => {
            state.user.isLocationLoading = true
            state.user.locationError = null
          })

          try {
            const position = await new Promise<GeolocationPosition>(
              (resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 60000,
                })
              }
            )

            set((state) => {
              state.user.currentLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }
              state.user.isLocationLoading = false

              // Update map center
              state.freeWorld.mapRegion.center = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }
            })
          } catch (error) {
            set((state) => {
              state.user.isLocationLoading = false
              state.user.locationError = 'Could not get location'
            })
          }
        },

        // ========================================
        // FREE WORLD ACTIONS
        // ========================================

        toggleAvailability: () =>
          set((state) => {
            state.freeWorld.isAvailable = !state.freeWorld.isAvailable
            state.freeWorld.availabilityStatus = state.freeWorld.isAvailable
              ? 'available'
              : 'offline'
          }),

        setAvailableUntil: (date) =>
          set((state) => {
            state.freeWorld.availableUntil = date
          }),

        setAvailabilityStatus: (status) =>
          set((state) => {
            state.freeWorld.availabilityStatus = status
            state.freeWorld.isAvailable = status === 'available'
          }),

        loadNearbyWorkers: async () => {
          set((state) => {
            state.freeWorld.isLoadingNearby = true
          })

          try {
            const location = get().user.currentLocation
            const params = new URLSearchParams()
            if (location) {
              params.set('latitude', String(location.latitude))
              params.set('longitude', String(location.longitude))
            }
            params.set('radius', '10')

            const res = await fetch(`/api/shifts/nearby?${params}`)
            if (!res.ok) throw new Error('Failed to load nearby')

            const data = await res.json()

            set((state) => {
              state.freeWorld.nearbyWorkers = (data.shifts || []).map((s: any) => ({
                id: s.employer_id,
                name: s.employer_name || '',
                avatar: s.employer_avatar || '',
                rating: 0,
                isVerified: false,
                skills: [],
                availabilityStatus: 'available' as const,
                reviewCount: 0,
                phone: '',
                location: s.location,
                completedTasks: 0,
                memberSince: '',
                responseTime: 0,
              }))
              state.freeWorld.isLoadingNearby = false
            })
          } catch (error) {
            console.error('Failed to load nearby workers:', error)
            set((state) => {
              state.freeWorld.isLoadingNearby = false
            })
            get().showToast('Failed to load nearby workers', 'error')
          }
        },

        loadNearbyTasks: async () => {
          set((state) => {
            state.freeWorld.isLoadingNearby = true
          })

          try {
            const location = get().user.currentLocation
            const params = new URLSearchParams()
            if (location) {
              params.set('latitude', String(location.latitude))
              params.set('longitude', String(location.longitude))
            }
            params.set('radius', '10')

            const res = await fetch(`/api/shifts/nearby?${params}`)
            if (!res.ok) throw new Error('Failed to load nearby tasks')

            const data = await res.json()

            set((state) => {
              state.freeWorld.nearbyTasks = (data.shifts || []).map((s: any) => ({
                id: s.id,
                title: s.title,
                description: s.description,
                category: s.category,
                rate: s.hourly_rate,
                location: s.location,
                distance: s.distance,
                urgency: s.urgency || 'normal',
                postedAt: s.created_at,
                employer: {
                  id: s.employer_id,
                  name: s.employer_name || '',
                  avatar: s.employer_avatar || '',
                  rating: 0,
                },
              }))
              state.freeWorld.isLoadingNearby = false
            })
          } catch (error) {
            console.error('Failed to load nearby tasks:', error)
            set((state) => {
              state.freeWorld.isLoadingNearby = false
            })
            get().showToast('Failed to load nearby tasks', 'error')
          }
        },

        setMapRegion: (region) =>
          set((state) => {
            state.freeWorld.mapRegion = region
          }),

        selectMarker: (id) =>
          set((state) => {
            state.freeWorld.selectedMarkerId = id
          }),

        startQuickRegistration: () =>
          set((state) => {
            state.freeWorld.isQuickRegistering = true
            state.freeWorld.quickRegistrationStep = 1
          }),

        nextQuickRegistrationStep: () =>
          set((state) => {
            state.freeWorld.quickRegistrationStep += 1
          }),

        finishQuickRegistration: (profile) =>
          set((state) => {
            state.user.quickProfile = profile
            state.freeWorld.isQuickRegistering = false
            state.freeWorld.quickRegistrationStep = 0
            state.auth.isAuthenticated = true
          }),

        // ========================================
        // WORKER ACTIONS
        // ========================================

        loadShifts: async () => {
          set((state) => {
            state.worker.isLoadingShifts = true
          })

          try {
            const filters = get().worker.filters
            const params = new URLSearchParams()
            params.set('status', 'active')
            if (filters.search) params.set('search', filters.search)
            if (filters.minRate) params.set('min_rate', String(filters.minRate))
            if (filters.maxRate) params.set('max_rate', String(filters.maxRate))

            const res = await fetch(`/api/shifts?${params}`)
            if (!res.ok) throw new Error('Failed to load shifts')

            const data = await res.json()

            set((state) => {
              state.worker.shifts = data.shifts || []
              state.worker.isLoadingShifts = false
            })
          } catch (error) {
            console.error('Failed to load shifts:', error)
            set((state) => {
              state.worker.isLoadingShifts = false
            })
            get().showToast('Failed to load shifts', 'error')
          }
        },

        loadRecommendedShifts: async () => {
          try {
            const location = get().user.currentLocation
            const params = new URLSearchParams({ status: 'active', limit: '10' })
            if (location) {
              params.set('latitude', String(location.latitude))
              params.set('longitude', String(location.longitude))
            }

            const res = await fetch(`/api/shifts/nearby?${params}`)
            if (!res.ok) return

            const data = await res.json()

            set((state) => {
              state.worker.recommendedShifts = data.shifts || []
            })
          } catch (error) {
            console.error('Failed to load recommended shifts:', error)
          }
        },

        loadMyTasks: async () => {
          set((state) => {
            state.worker.isLoadingTasks = true
          })

          try {
            const res = await fetch('/api/applications')
            if (!res.ok) throw new Error('Failed to load tasks')

            const data = await res.json()

            set((state) => {
              state.worker.myTasks = data.applications || []
              state.worker.activeTask = (data.applications || []).find(
                (t: TaskFlow) => t.status === 'in_progress'
              ) || null
              state.worker.isLoadingTasks = false
              state.worker.completedShifts = (data.applications || []).filter(
                (t: TaskFlow) => t.status === 'completed' || t.status === 'paid'
              ).length
            })
          } catch (error) {
            console.error('Failed to load tasks:', error)
            set((state) => {
              state.worker.isLoadingTasks = false
            })
            get().showToast('Failed to load your tasks', 'error')
          }
        },

        applyToShift: async (shiftId, message) => {
          try {
            const res = await fetch('/api/applications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ shift_id: shiftId, message }),
            })

            if (!res.ok) {
              const err = await res.json()
              throw new Error(err.error || 'Failed to apply')
            }

            get().showToast('Application sent!', 'success')
            // Reload tasks to show the new application
            get().loadMyTasks()
          } catch (error) {
            get().showToast(error instanceof Error ? error.message : 'Failed to apply', 'error')
            throw error
          }
        },

        cancelApplication: async (taskFlowId) => {
          try {
            const res = await fetch(`/api/applications/${taskFlowId}`, {
              method: 'DELETE',
            })

            if (!res.ok) {
              const err = await res.json()
              throw new Error(err.error || 'Failed to cancel')
            }

            set((state) => {
              state.worker.myTasks = state.worker.myTasks.filter(
                (t) => t.id !== taskFlowId
              )
            })

            get().showToast('Application cancelled', 'info')
          } catch (error) {
            get().showToast('Failed to cancel', 'error')
            throw error
          }
        },

        setWorkerFilters: (filters) =>
          set((state) => {
            Object.assign(state.worker.filters, filters)
          }),

        resetWorkerFilters: () =>
          set((state) => {
            state.worker.filters = defaultFilterState
          }),

        // ========================================
        // EMPLOYER ACTIONS
        // ========================================

        loadMyShifts: async () => {
          set((state) => {
            state.employer.isLoadingShifts = true
          })

          try {
            const res = await fetch('/api/shifts?my=true')
            if (!res.ok) throw new Error('Failed to load shifts')

            const data = await res.json()

            set((state) => {
              state.employer.myShifts = data.shifts || []
              state.employer.isLoadingShifts = false
              state.employer.shiftsThisMonth = (data.shifts || []).filter(
                (s: ShiftPosting) => {
                  const created = new Date(s.createdAt)
                  const now = new Date()
                  return created.getMonth() === now.getMonth() &&
                         created.getFullYear() === now.getFullYear()
                }
              ).length
            })
          } catch (error) {
            console.error('Failed to load shifts:', error)
            set((state) => {
              state.employer.isLoadingShifts = false
            })
            get().showToast('Failed to load your shifts', 'error')
          }
        },

        createShift: async (shift) => {
          try {
            const res = await fetch('/api/shifts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(shift),
            })

            if (!res.ok) {
              const err = await res.json()
              throw new Error(err.error || 'Failed to create shift')
            }

            const data = await res.json()

            set((state) => {
              state.employer.myShifts.unshift(data.shift)
            })

            get().showToast('Shift created!', 'success')
          } catch (error) {
            get().showToast(error instanceof Error ? error.message : 'Failed to create shift', 'error')
            throw error
          }
        },

        updateShift: async (shiftId, updates) => {
          try {
            const res = await fetch(`/api/shifts/${shiftId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates),
            })

            if (!res.ok) {
              const err = await res.json()
              throw new Error(err.error || 'Failed to update shift')
            }

            const data = await res.json()

            set((state) => {
              const index = state.employer.myShifts.findIndex(
                (s) => s.id === shiftId
              )
              if (index !== -1) {
                state.employer.myShifts[index] = data.shift
              }
            })

            get().showToast('Shift updated', 'success')
          } catch (error) {
            get().showToast('Failed to update shift', 'error')
            throw error
          }
        },

        deleteShift: async (shiftId) => {
          try {
            const res = await fetch(`/api/shifts/${shiftId}`, {
              method: 'DELETE',
            })

            if (!res.ok) {
              const err = await res.json()
              throw new Error(err.error || 'Failed to delete shift')
            }

            set((state) => {
              state.employer.myShifts = state.employer.myShifts.filter(
                (s) => s.id !== shiftId
              )
            })

            get().showToast('Shift deleted', 'info')
          } catch (error) {
            get().showToast('Failed to delete shift', 'error')
            throw error
          }
        },

        loadApplications: async (shiftId) => {
          set((state) => {
            state.employer.isLoadingApplications = true
          })

          try {
            const res = await fetch(`/api/applications?shift_id=${shiftId}`)
            if (!res.ok) throw new Error('Failed to load applications')

            const data = await res.json()
            const applications: TaskFlow[] = data.applications || []

            set((state) => {
              state.employer.pendingApplications = applications.filter(
                (a) => a.status === 'applied'
              )
              state.employer.approvedWorkers = applications.filter(
                (a) => a.status === 'approved' || a.status === 'in_progress'
              )
              state.employer.isLoadingApplications = false
              state.employer.activeWorkers = applications.filter(
                (a) => a.status === 'in_progress'
              ).length
            })
          } catch (error) {
            console.error('Failed to load applications:', error)
            set((state) => {
              state.employer.isLoadingApplications = false
            })
            get().showToast('Failed to load applications', 'error')
          }
        },

        approveApplication: async (taskFlowId) => {
          try {
            const res = await fetch(`/api/applications/${taskFlowId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'approved' }),
            })

            if (!res.ok) {
              const err = await res.json()
              throw new Error(err.error || 'Failed to approve')
            }

            set((state) => {
              const app = state.employer.pendingApplications.find(
                (a) => a.id === taskFlowId
              )
              if (app) {
                app.status = 'approved'
                state.employer.approvedWorkers.push(app)
                state.employer.pendingApplications =
                  state.employer.pendingApplications.filter(
                    (a) => a.id !== taskFlowId
                  )
              }
            })

            get().showToast('Worker approved!', 'success')
          } catch (error) {
            get().showToast('Failed to approve', 'error')
            throw error
          }
        },

        rejectApplication: async (taskFlowId) => {
          try {
            const res = await fetch(`/api/applications/${taskFlowId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'rejected' }),
            })

            if (!res.ok) {
              const err = await res.json()
              throw new Error(err.error || 'Failed to reject')
            }

            set((state) => {
              state.employer.pendingApplications =
                state.employer.pendingApplications.filter(
                  (a) => a.id !== taskFlowId
                )
            })

            get().showToast('Application rejected', 'info')
          } catch (error) {
            get().showToast('Failed to reject', 'error')
            throw error
          }
        },

        // ========================================
        // UI ACTIONS
        // ========================================

        setLanguage: (lang) =>
          set((state) => {
            state.ui.language = lang
            state.ui.isRTL = lang === 'he' || lang === 'ar'
          }),

        toggleTheme: () =>
          set((state) => {
            state.ui.theme = state.ui.theme === 'light' ? 'dark' : 'light'
          }),

        openFilterModal: () =>
          set((state) => {
            state.ui.isFilterModalOpen = true
          }),

        closeFilterModal: () =>
          set((state) => {
            state.ui.isFilterModalOpen = false
          }),

        openProfileModal: () =>
          set((state) => {
            state.ui.isProfileModalOpen = true
          }),

        closeProfileModal: () =>
          set((state) => {
            state.ui.isProfileModalOpen = false
          }),

        openShiftDetail: (shiftId) =>
          set((state) => {
            state.ui.selectedShiftId = shiftId
            state.ui.isShiftDetailOpen = true
          }),

        closeShiftDetail: () =>
          set((state) => {
            state.ui.selectedShiftId = null
            state.ui.isShiftDetailOpen = false
          }),

        openWorkerDetail: (workerId) =>
          set((state) => {
            state.ui.selectedWorkerId = workerId
            state.ui.isWorkerDetailOpen = true
          }),

        closeWorkerDetail: () =>
          set((state) => {
            state.ui.selectedWorkerId = null
            state.ui.isWorkerDetailOpen = false
          }),

        setBottomSheet: (sheet) =>
          set((state) => {
            state.ui.activeBottomSheet = sheet
          }),

        setSearchQuery: (query) =>
          set((state) => {
            state.ui.searchQuery = query
          }),

        search: async () => {
          const query = get().ui.searchQuery
          if (!query.trim()) {
            set((state) => {
              state.ui.searchResults = []
            })
            return
          }

          set((state) => {
            state.ui.isSearching = true
          })

          try {
            const location = get().user.currentLocation
            const res = await fetch('/api/shifts/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query,
                location: location ? {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  radius: 50,
                } : undefined,
              }),
            })

            if (!res.ok) throw new Error('Search failed')

            const data = await res.json()

            set((state) => {
              state.ui.searchResults = data.shifts || []
              state.ui.isSearching = false
            })
          } catch (error) {
            set((state) => {
              state.ui.isSearching = false
            })
          }
        },

        showToast: (message, type) =>
          set((state) => {
            state.ui.toast = { message, type, isVisible: true }
          }),

        hideToast: () =>
          set((state) => {
            state.ui.toast.isVisible = false
          }),

        markNotificationRead: async (id) => {
          set((state) => {
            const notification = state.ui.notifications.find((n) => n.id === id)
            if (notification && !notification.read) {
              notification.read = true
              state.ui.unreadCount = Math.max(0, state.ui.unreadCount - 1)
            }
          })

          try {
            await fetch('/api/notifications', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id }),
            })
          } catch {
            // optimistic update - don't revert on error
          }
        },

        markAllNotificationsRead: async () => {
          set((state) => {
            state.ui.notifications.forEach((n) => (n.read = true))
            state.ui.unreadCount = 0
          })

          try {
            await fetch('/api/notifications', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ markAll: true }),
            })
          } catch {
            // optimistic update - don't revert on error
          }
        },

        // ========================================
        // SUBSCRIPTION ACTIONS
        // ========================================

        startTrial: () =>
          set((state) => {
            const now = new Date()
            const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days

            state.subscription.subscriptionState = 'trial_active'
            state.subscription.trialStatus = 'active'
            state.subscription.trialStartedAt = now
            state.subscription.trialEndsAt = trialEnd
            state.subscription.currentPlan = 'pro' // Full access during trial
          }),

        checkTrialStatus: () => {
          const { trialEndsAt, trialStatus } = get().subscription

          if (!trialEndsAt || trialStatus === 'ended') return

          const now = new Date()
          const timeRemaining = trialEndsAt.getTime() - now.getTime()
          const hoursRemaining = timeRemaining / (1000 * 60 * 60)

          set((state) => {
            if (timeRemaining <= 0) {
              state.subscription.trialStatus = 'ended'
              state.subscription.subscriptionState = 'trial_ended'
              state.subscription.currentPlan = 'free'
              state.subscription.showTrialEndModal = true
            } else if (hoursRemaining <= 3) {
              state.subscription.trialStatus = 'ending_soon'
            }
          })
        },

        subscribe: async (plan) => {
          try {
            // TODO: Implement actual payment API (Stripe/PayPlus)
            await new Promise((resolve) => setTimeout(resolve, 1000))

            set((state) => {
              state.subscription.subscriptionState = 'subscribed'
              state.subscription.currentPlan = plan
              state.subscription.trialStatus = 'ended'
              state.subscription.showPricingModal = false
              state.subscription.showTrialEndModal = false
            })

            get().showToast('Welcome to PRO!', 'success')
          } catch (error) {
            get().showToast('Payment failed. Please try again.', 'error')
            throw error
          }
        },

        cancelSubscription: async () => {
          try {
            // TODO: Implement actual API call
            await new Promise((resolve) => setTimeout(resolve, 500))

            set((state) => {
              state.subscription.subscriptionState = 'free_limited'
              state.subscription.currentPlan = 'free'
            })

            get().showToast('Subscription cancelled', 'info')
          } catch (error) {
            get().showToast('Failed to cancel subscription', 'error')
            throw error
          }
        },

        openTrialEndModal: () =>
          set((state) => {
            state.subscription.showTrialEndModal = true
          }),

        closeTrialEndModal: () =>
          set((state) => {
            state.subscription.showTrialEndModal = false
          }),

        openPricingModal: () =>
          set((state) => {
            state.subscription.showPricingModal = true
          }),

        closePricingModal: () =>
          set((state) => {
            state.subscription.showPricingModal = false
          }),

        updateTrialStats: (stats) =>
          set((state) => {
            Object.assign(state.subscription.trialStats, stats)
          }),

        getTrialDaysRemaining: () => {
          const { trialEndsAt } = get().subscription
          if (!trialEndsAt) return 0
          const remaining = trialEndsAt.getTime() - Date.now()
          return Math.max(0, Math.ceil(remaining / (1000 * 60 * 60 * 24)))
        },

        getTrialHoursRemaining: () => {
          const { trialEndsAt } = get().subscription
          if (!trialEndsAt) return 0
          const remaining = trialEndsAt.getTime() - Date.now()
          return Math.max(0, Math.ceil(remaining / (1000 * 60 * 60)))
        },
      })),
      {
        name: 'connector-storage',
        partialize: (state) => ({
          auth: {
            isAuthenticated: state.auth.isAuthenticated,
            userId: state.auth.userId,
          },
          user: {
            mode: state.user.mode,
            quickProfile: state.user.quickProfile,
          },
          ui: {
            language: state.ui.language,
            theme: state.ui.theme,
          },
          subscription: {
            subscriptionState: state.subscription.subscriptionState,
            currentPlan: state.subscription.currentPlan,
            trialStatus: state.subscription.trialStatus,
            trialStartedAt: state.subscription.trialStartedAt,
            trialEndsAt: state.subscription.trialEndsAt,
            trialStats: state.subscription.trialStats,
          },
        }),
      }
    ),
    { name: 'ConnectorStore' }
  )
)

// ============================================
// SELECTOR HOOKS
// ============================================

export const useAuth = () => useConnectorStore((state) => state.auth)
export const useUser = () => useConnectorStore((state) => state.user)
export const useFreeWorld = () => useConnectorStore((state) => state.freeWorld)
export const useWorker = () => useConnectorStore((state) => state.worker)
export const useEmployer = () => useConnectorStore((state) => state.employer)
export const useUI = () => useConnectorStore((state) => state.ui)
export const useSubscription = () => useConnectorStore((state) => state.subscription)

// Computed selectors
export const useIsWorkerMode = () =>
  useConnectorStore((state) => state.user.mode === 'worker')
export const useIsEmployerMode = () =>
  useConnectorStore((state) => state.user.mode === 'employer')
export const useIsFreeWorldMode = () =>
  useConnectorStore((state) => state.user.mode === 'free-world')
export const useCurrentProfile = () =>
  useConnectorStore((state) => {
    switch (state.user.mode) {
      case 'worker':
        return state.user.workerProfile
      case 'employer':
        return state.user.employerProfile
      default:
        return state.user.quickProfile
    }
  })
