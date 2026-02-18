// ============================================
// CONNECTOR 2.0 - Admin Panel Zustand Store
// ============================================

import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Language } from '@/types'
import type {
  AdminUser,
  AdminStats,
  AdminNotificationCampaign,
  PendingModeration,
  AdminUserView,
  AdminShiftView,
  AdminPaymentView,
  AdminReviewView,
  AdminDocumentView,
  Dispute,
} from '@/types/admin'

// ============================================
// STATE INTERFACES
// ============================================

interface AdminAuthState {
  isAuthenticated: boolean
  isLoading: boolean
  admin: AdminUser | null
  token: string | null
  error: string | null
}

interface AdminUIState {
  language: Language
  sidebarCollapsed: boolean
  theme: 'light' | 'dark'
  activeFilters: Record<string, unknown>
  searchQuery: string
}

interface AdminDashboardState {
  stats: AdminStats | null
  isLoadingStats: boolean
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: Date
    userId?: string
    userName?: string
  }>
  alerts: Array<{
    id: string
    type: 'info' | 'warning' | 'error'
    message: string
    actionUrl?: string
  }>
}

interface AdminModerationState {
  pendingShifts: PendingModeration[]
  pendingDocuments: PendingModeration[]
  pendingReviews: PendingModeration[]
  disputes: Dispute[]
  isLoadingModeration: boolean
}

interface AdminNotificationsState {
  campaigns: AdminNotificationCampaign[]
  templates: Array<{
    id: string
    name: string
    content: Record<Language, { title: string; body: string }>
  }>
  isLoadingCampaigns: boolean
}

// ============================================
// COMBINED ADMIN STORE INTERFACE
// ============================================

interface AdminStore {
  // States
  auth: AdminAuthState
  ui: AdminUIState
  dashboard: AdminDashboardState
  moderation: AdminModerationState
  notifications: AdminNotificationsState

  // Auth actions
  loginAdmin: (email: string, password: string) => Promise<void>
  logoutAdmin: () => void
  refreshToken: () => Promise<void>

  // UI actions
  setLanguage: (lang: Language) => void
  toggleSidebar: () => void
  toggleTheme: () => void
  setFilters: (filters: Record<string, unknown>) => void
  setSearchQuery: (query: string) => void
  clearFilters: () => void

  // Dashboard actions
  loadDashboardStats: () => Promise<void>
  loadRecentActivity: () => Promise<void>

  // Moderation actions
  loadPendingShifts: () => Promise<void>
  loadPendingDocuments: () => Promise<void>
  loadPendingReviews: () => Promise<void>
  loadDisputes: () => Promise<void>
  approveShift: (shiftId: string) => Promise<void>
  rejectShift: (shiftId: string, reason: string) => Promise<void>
  verifyDocument: (docId: string) => Promise<void>
  rejectDocument: (docId: string, reason: string) => Promise<void>
  approveReview: (reviewId: string) => Promise<void>
  hideReview: (reviewId: string, reason: string) => Promise<void>
  resolveDispute: (disputeId: string, resolution: Dispute['resolution']) => Promise<void>

  // User management actions
  blockUser: (userId: string, reason: string, duration?: number) => Promise<void>
  unblockUser: (userId: string) => Promise<void>
  verifyUser: (userId: string) => Promise<void>

  // Notification actions
  loadCampaigns: () => Promise<void>
  createCampaign: (campaign: Omit<AdminNotificationCampaign, 'id'>) => Promise<void>
  sendNotification: (payload: {
    channels: string[]
    target: { type: string; userIds?: string[] }
    content: Record<string, { title: string; body: string }>
  }) => Promise<void>

  // Payment actions
  refundPayment: (paymentId: string, amount: number, reason: string) => Promise<void>
  releaseEscrow: (escrowId: string) => Promise<void>
}

// ============================================
// DEFAULT STATES
// ============================================

const defaultAuthState: AdminAuthState = {
  isAuthenticated: false,
  isLoading: false,
  admin: null,
  token: null,
  error: null,
}

const defaultUIState: AdminUIState = {
  language: 'ru',
  sidebarCollapsed: false,
  theme: 'light',
  activeFilters: {},
  searchQuery: '',
}

const defaultDashboardState: AdminDashboardState = {
  stats: null,
  isLoadingStats: false,
  recentActivity: [],
  alerts: [],
}

const defaultModerationState: AdminModerationState = {
  pendingShifts: [],
  pendingDocuments: [],
  pendingReviews: [],
  disputes: [],
  isLoadingModeration: false,
}

const defaultNotificationsState: AdminNotificationsState = {
  campaigns: [],
  templates: [],
  isLoadingCampaigns: false,
}

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

const mockStats: AdminStats = {
  totalUsers: 12847,
  activeUsers: 3421,
  newUsersToday: 156,
  newUsersWeek: 892,
  totalWorkers: 8234,
  totalEmployers: 4613,
  totalShifts: 45678,
  activeShifts: 234,
  completedShiftsToday: 89,
  pendingModeration: 37,
  totalRevenue: 2456000,
  revenueToday: 34500,
  revenueWeek: 187000,
  platformFees: 245600,
  pendingPayouts: 78000,
  disputesOpen: 12,
  avgResponseTime: 4.2,
  avgRating: 4.7,
  conversionRate: 34.5,
}

const mockPendingShifts: PendingModeration[] = [
  {
    id: '1',
    type: 'shift',
    entityId: 'shift_1',
    reason: 'New listing',
    createdAt: new Date(),
    priority: 'medium',
  },
  {
    id: '2',
    type: 'shift',
    entityId: 'shift_2',
    reason: 'Reported content',
    createdAt: new Date(),
    priority: 'high',
  },
]

const mockPendingDocuments: PendingModeration[] = [
  {
    id: '1',
    type: 'document',
    entityId: 'doc_1',
    createdAt: new Date(),
    priority: 'medium',
  },
  {
    id: '2',
    type: 'document',
    entityId: 'doc_2',
    createdAt: new Date(),
    priority: 'low',
  },
]

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useAdminStore = create<AdminStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial states
        auth: defaultAuthState,
        ui: defaultUIState,
        dashboard: defaultDashboardState,
        moderation: defaultModerationState,
        notifications: defaultNotificationsState,

        // ========================================
        // AUTH ACTIONS
        // ========================================

        loginAdmin: async (email, password) => {
          set((state) => {
            state.auth.isLoading = true
            state.auth.error = null
          })

          try {
            const res = await fetch('/api/admin/auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
              throw new Error(data.error || 'Login failed')
            }

            set((state) => {
              state.auth.isAuthenticated = true
              state.auth.admin = data.admin
              state.auth.token = data.token
              state.auth.isLoading = false
            })

            // Set cookie for middleware
            if (typeof document !== 'undefined') {
              document.cookie = `admin-token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`
            }
          } catch (error) {
            set((state) => {
              state.auth.error = error instanceof Error ? error.message : 'Login failed'
              state.auth.isLoading = false
            })
            throw error
          }
        },

        logoutAdmin: () => {
          set((state) => {
            state.auth = defaultAuthState
          })

          // Clear cookie
          if (typeof document !== 'undefined') {
            document.cookie = 'admin-token=; path=/; max-age=0'
          }
        },

        refreshToken: async () => {
          const token = get().auth.token
          if (!token) return

          try {
            const res = await fetch('/api/admin/auth', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ refresh: true }),
            })

            if (!res.ok) {
              get().logoutAdmin()
              return
            }

            const data = await res.json()
            set((state) => {
              state.auth.token = data.token
            })

            if (typeof document !== 'undefined') {
              document.cookie = `admin-token=${data.token}; path=/; max-age=${2 * 60 * 60}`
            }
          } catch {
            get().logoutAdmin()
          }
        },

        // ========================================
        // UI ACTIONS
        // ========================================

        setLanguage: (lang) =>
          set((state) => {
            state.ui.language = lang
          }),

        toggleSidebar: () =>
          set((state) => {
            state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed
          }),

        toggleTheme: () =>
          set((state) => {
            state.ui.theme = state.ui.theme === 'light' ? 'dark' : 'light'
          }),

        setFilters: (filters) =>
          set((state) => {
            state.ui.activeFilters = { ...state.ui.activeFilters, ...filters }
          }),

        setSearchQuery: (query) =>
          set((state) => {
            state.ui.searchQuery = query
          }),

        clearFilters: () =>
          set((state) => {
            state.ui.activeFilters = {}
            state.ui.searchQuery = ''
          }),

        // ========================================
        // DASHBOARD ACTIONS
        // ========================================

        loadDashboardStats: async () => {
          set((state) => {
            state.dashboard.isLoadingStats = true
          })

          try {
            const token = get().auth.token
            const res = await fetch('/api/admin/dashboard', {
              headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
              const data = await res.json()
              set((state) => {
                state.dashboard.stats = {
                  totalUsers: data.stats.users.total,
                  activeUsers: data.stats.users.total,
                  newUsersToday: 0,
                  newUsersWeek: 0,
                  totalWorkers: data.stats.users.workers,
                  totalEmployers: data.stats.users.employers,
                  totalShifts: data.stats.shifts.total,
                  activeShifts: data.stats.shifts.active,
                  completedShiftsToday: 0,
                  pendingModeration: data.stats.documents.pending,
                  totalRevenue: data.stats.revenue.volume,
                  revenueToday: 0,
                  revenueWeek: 0,
                  platformFees: data.stats.revenue.total,
                  pendingPayouts: 0,
                  disputesOpen: data.stats.disputes.pending,
                  avgResponseTime: 0,
                  avgRating: 0,
                  conversionRate: 0,
                }
                state.dashboard.isLoadingStats = false
              })
            } else {
              // Fallback to mock stats if API not ready
              set((state) => {
                state.dashboard.stats = mockStats
                state.dashboard.isLoadingStats = false
              })
            }
          } catch (error) {
            set((state) => {
              state.dashboard.stats = mockStats
              state.dashboard.isLoadingStats = false
            })
          }
        },

        loadRecentActivity: async () => {
          const token = get().auth.token
          try {
            const res = await fetch('/api/admin/dashboard?section=activity', {
              headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
              const data = await res.json()
              if (data.recentActivity) {
                set((state) => {
                  state.dashboard.recentActivity = data.recentActivity
                })
                return
              }
            }
          } catch {
            // Fall through to mock data
          }

          // Fallback mock data
          set((state) => {
            state.dashboard.recentActivity = [
              {
                id: '1',
                type: 'user_registered',
                description: 'New user registered',
                timestamp: new Date(),
                userName: 'John Doe',
              },
              {
                id: '2',
                type: 'shift_created',
                description: 'New shift posted',
                timestamp: new Date(),
                userName: 'ABC Company',
              },
              {
                id: '3',
                type: 'payment_completed',
                description: 'Payment released',
                timestamp: new Date(),
              },
            ]
          })
        },

        // ========================================
        // MODERATION ACTIONS
        // ========================================

        loadPendingShifts: async () => {
          set((state) => {
            state.moderation.isLoadingModeration = true
          })

          await new Promise((resolve) => setTimeout(resolve, 500))

          set((state) => {
            state.moderation.pendingShifts = mockPendingShifts
            state.moderation.isLoadingModeration = false
          })
        },

        loadPendingDocuments: async () => {
          set((state) => {
            state.moderation.isLoadingModeration = true
          })

          await new Promise((resolve) => setTimeout(resolve, 500))

          set((state) => {
            state.moderation.pendingDocuments = mockPendingDocuments
            state.moderation.isLoadingModeration = false
          })
        },

        loadPendingReviews: async () => {
          set((state) => {
            state.moderation.isLoadingModeration = true
          })

          const token = get().auth.token
          try {
            const res = await fetch('/api/reviews?status=pending&limit=50', {
              headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
              const data = await res.json()
              set((state) => {
                state.moderation.pendingReviews = data.reviews || []
                state.moderation.isLoadingModeration = false
              })
              return
            }
          } catch {
            // Fall through
          }

          set((state) => {
            state.moderation.pendingReviews = []
            state.moderation.isLoadingModeration = false
          })
        },

        loadDisputes: async () => {
          set((state) => {
            state.moderation.isLoadingModeration = true
          })

          const token = get().auth.token
          try {
            const res = await fetch('/api/disputes?status=open,escalated&limit=50', {
              headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
              const data = await res.json()
              set((state) => {
                state.moderation.disputes = data.disputes || []
                state.moderation.isLoadingModeration = false
              })
              return
            }
          } catch {
            // Fall through
          }

          set((state) => {
            state.moderation.disputes = []
            state.moderation.isLoadingModeration = false
          })
        },

        approveShift: async (shiftId) => {
          const token = get().auth.token
          const res = await fetch(`/api/admin/shifts/${shiftId}/moderate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: 'approve' }),
          })

          if (res.ok) {
            set((state) => {
              state.moderation.pendingShifts = state.moderation.pendingShifts.filter(
                (s) => s.entityId !== shiftId
              )
            })
          }
        },

        rejectShift: async (shiftId, reason) => {
          const token = get().auth.token
          const res = await fetch(`/api/admin/shifts/${shiftId}/moderate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: 'reject', reason }),
          })

          if (res.ok) {
            set((state) => {
              state.moderation.pendingShifts = state.moderation.pendingShifts.filter(
                (s) => s.entityId !== shiftId
              )
            })
          }
        },

        verifyDocument: async (docId) => {
          const token = get().auth.token
          const res = await fetch(`/api/admin/documents/${docId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: 'verify' }),
          })

          if (res.ok) {
            set((state) => {
              state.moderation.pendingDocuments = state.moderation.pendingDocuments.filter(
                (d) => d.entityId !== docId
              )
            })
          }
        },

        rejectDocument: async (docId, reason) => {
          const token = get().auth.token
          const res = await fetch(`/api/admin/documents/${docId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: 'reject', reason }),
          })

          if (res.ok) {
            set((state) => {
              state.moderation.pendingDocuments = state.moderation.pendingDocuments.filter(
                (d) => d.entityId !== docId
              )
            })
          }
        },

        approveReview: async (reviewId) => {
          const token = get().auth.token
          await fetch(`/api/admin/reviews/${reviewId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ action: 'approve' }),
          })
        },

        hideReview: async (reviewId, reason) => {
          const token = get().auth.token
          await fetch(`/api/admin/reviews/${reviewId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ action: 'hide', reason }),
          })
        },

        resolveDispute: async (disputeId, resolution) => {
          const token = get().auth.token
          await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(resolution),
          })
        },

        // ========================================
        // USER MANAGEMENT ACTIONS
        // ========================================

        blockUser: async (userId, reason, duration) => {
          const token = get().auth.token
          await fetch(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ is_banned: true, ban_reason: reason, ban_duration: duration }),
          })
        },

        unblockUser: async (userId) => {
          const token = get().auth.token
          await fetch(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ is_banned: false, ban_reason: null }),
          })
        },

        verifyUser: async (userId) => {
          const token = get().auth.token
          await fetch(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ is_verified: true }),
          })
        },

        // ========================================
        // NOTIFICATION ACTIONS
        // ========================================

        loadCampaigns: async () => {
          set((state) => {
            state.notifications.isLoadingCampaigns = true
          })

          await new Promise((resolve) => setTimeout(resolve, 500))

          set((state) => {
            state.notifications.isLoadingCampaigns = false
          })
        },

        createCampaign: async (campaign) => {
          const token = get().auth.token
          await fetch('/api/admin/notifications/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(campaign),
          })
        },

        sendNotification: async (payload) => {
          const token = get().auth.token
          await fetch('/api/admin/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          })
        },

        // ========================================
        // PAYMENT ACTIONS
        // ========================================

        refundPayment: async (paymentId, amount, reason) => {
          const token = get().auth.token
          await fetch(`/api/admin/payments/${paymentId}/refund`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ amount, reason }),
          })
        },

        releaseEscrow: async (escrowId) => {
          const token = get().auth.token
          await fetch(`/api/payments/escrow/${escrowId}/release`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({}),
          })
        },
      })),
      {
        name: 'connector-admin-storage',
        partialize: (state) => ({
          auth: {
            isAuthenticated: state.auth.isAuthenticated,
            token: state.auth.token,
            admin: state.auth.admin,
          },
          ui: {
            language: state.ui.language,
            sidebarCollapsed: state.ui.sidebarCollapsed,
            theme: state.ui.theme,
          },
        }),
      }
    ),
    { name: 'AdminStore' }
  )
)

// ============================================
// SELECTOR HOOKS
// ============================================

export const useAdminAuth = () => useAdminStore((state) => state.auth)
export const useAdminUI = () => useAdminStore((state) => state.ui)
export const useAdminDashboard = () => useAdminStore((state) => state.dashboard)
export const useAdminModeration = () => useAdminStore((state) => state.moderation)
export const useAdminNotifications = () => useAdminStore((state) => state.notifications)

// Check if user is admin
export const useIsAdmin = () =>
  useAdminStore((state) => state.auth.isAuthenticated && state.auth.admin !== null)
