import type { Language, VerificationStatus, PaymentStatus } from './index'

// ============================================
// ADMIN USER
// ============================================

export type AdminRole = 'superadmin' | 'admin' | 'moderator' | 'support'

export type AdminPermission =
  | 'all'
  | 'users.view'
  | 'users.edit'
  | 'users.block'
  | 'shifts.view'
  | 'shifts.moderate'
  | 'shifts.delete'
  | 'payments.view'
  | 'payments.refund'
  | 'reviews.view'
  | 'reviews.moderate'
  | 'documents.view'
  | 'documents.verify'
  | 'notifications.view'
  | 'notifications.send'
  | 'settings.view'
  | 'settings.edit'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: AdminRole
  permissions: AdminPermission[]
  avatarUrl?: string
  createdAt: Date
  lastLoginAt: Date
}

// ============================================
// DASHBOARD STATS
// ============================================

export interface AdminStats {
  // Users
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  newUsersWeek: number
  totalWorkers: number
  totalEmployers: number

  // Shifts
  totalShifts: number
  activeShifts: number
  completedShiftsToday: number
  pendingModeration: number

  // Revenue
  totalRevenue: number
  revenueToday: number
  revenueWeek: number
  platformFees: number
  pendingPayouts: number

  // Metrics
  disputesOpen: number
  avgResponseTime: number
  avgRating: number
  conversionRate: number
}

export interface AdminStatsTimeSeries {
  date: string
  users: number
  shifts: number
  revenue: number
  completions: number
}

// ============================================
// MODERATION
// ============================================

export interface PendingModeration {
  id: string
  type: 'shift' | 'review' | 'document' | 'user'
  entityId: string
  reason?: string
  createdAt: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
}

export interface ModerationAction {
  id: string
  moderatorId: string
  moderatorName: string
  entityType: 'shift' | 'review' | 'document' | 'user'
  entityId: string
  action: 'approve' | 'reject' | 'block' | 'verify'
  reason?: string
  createdAt: Date
}

// ============================================
// USER MANAGEMENT
// ============================================

export interface AdminUserView {
  id: string
  phone: string
  name: string
  email?: string
  photoUrl?: string
  role: 'worker' | 'employer' | 'both'

  // Status
  isVerified: boolean
  verificationStatus: VerificationStatus
  isBlocked: boolean
  blockReason?: string
  blockedAt?: Date
  blockedUntil?: Date

  // Stats
  shiftsCompleted: number
  totalEarned: number
  totalPaid: number
  rating: number
  reviewCount: number
  disputeCount: number

  // Meta
  createdAt: Date
  lastActiveAt: Date
  registrationSource?: string
}

export interface UserBlock {
  userId: string
  reason: string
  blockedBy: string
  blockedAt: Date
  blockedUntil?: Date
  isActive: boolean
}

// ============================================
// NOTIFICATIONS
// ============================================

export type NotificationChannel = 'push' | 'sms' | 'email'

export type NotificationTargetType =
  | 'all'
  | 'workers'
  | 'employers'
  | 'verified'
  | 'unverified'
  | 'inactive'
  | 'custom'

export interface NotificationTarget {
  type: NotificationTargetType
  userIds?: string[]
  filters?: {
    city?: string
    skills?: string[]
    minRating?: number
    lastActiveAfter?: Date
    hasCompletedShifts?: boolean
  }
  estimatedReach?: number
}

export interface AdminNotificationCampaign {
  id: string
  name: string
  channels: NotificationChannel[]
  target: NotificationTarget

  content: {
    [K in Language]?: {
      title: string
      body: string
      imageUrl?: string
      actionUrl?: string
    }
  }

  scheduledAt?: Date
  sentAt?: Date

  totalSent: number
  delivered: number
  opened: number
  clicked: number

  createdBy: string
  createdAt: Date
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
}

// ============================================
// PAYMENTS / ESCROW ADMIN VIEW
// ============================================

export interface AdminPaymentView {
  id: string
  shiftId: string
  shiftTitle: string

  workerId: string
  workerName: string
  workerPhone: string

  employerId: string
  employerName: string
  employerCompany: string

  amount: number
  platformFee: number
  workerPayout: number

  status: PaymentStatus

  createdAt: Date
  escrowedAt?: Date
  releasedAt?: Date
  refundedAt?: Date

  refundReason?: string
  refundedBy?: string
}

// ============================================
// DISPUTES
// ============================================

export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'escalated'
export type DisputeType = 'payment' | 'quality' | 'no_show' | 'harassment' | 'other'

export interface Dispute {
  id: string
  type: DisputeType
  status: DisputeStatus

  shiftId: string
  shiftTitle: string
  taskFlowId: string

  initiatorId: string
  initiatorName: string
  initiatorRole: 'worker' | 'employer'

  respondentId: string
  respondentName: string

  description: string
  evidence?: string[]

  resolution?: {
    outcome: 'initiator_favor' | 'respondent_favor' | 'split' | 'dismissed'
    description: string
    refundAmount?: number
    resolvedBy: string
    resolvedAt: Date
  }

  messages: DisputeMessage[]

  createdAt: Date
  updatedAt: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
}

export interface DisputeMessage {
  id: string
  authorId: string
  authorName: string
  authorRole: 'worker' | 'employer' | 'admin'
  content: string
  attachments?: string[]
  createdAt: Date
}

// ============================================
// SHIFTS ADMIN VIEW
// ============================================

export interface AdminShiftView {
  id: string
  title: string
  description: string
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'rejected'

  employerId: string
  employerName: string
  employerCompany: string
  employerRating: number

  location: {
    address: string
    city: string
    lat: number
    lng: number
  }

  date: Date
  startTime: string
  endTime: string

  baseRate: number
  totalEstimate: number
  slots: number
  filled: number
  applicants: number

  createdAt: Date
  moderatedAt?: Date
  moderatedBy?: string
  rejectionReason?: string
}

// ============================================
// REVIEWS ADMIN VIEW
// ============================================

export interface AdminReviewView {
  id: string
  rating: number
  comment: string

  authorId: string
  authorName: string
  authorRole: 'worker' | 'employer'

  targetId: string
  targetName: string
  targetRole: 'worker' | 'employer'

  shiftId: string
  shiftTitle: string

  isHidden: boolean
  hiddenReason?: string
  hiddenBy?: string

  reportCount: number
  reportReasons?: string[]

  createdAt: Date
}

// ============================================
// DOCUMENTS ADMIN VIEW
// ============================================

export interface AdminDocumentView {
  id: string
  type: 'passport' | 'work_permit' | 'driver_license' | 'other'
  imageUrl: string

  userId: string
  userName: string
  userPhone: string

  status: VerificationStatus
  verifiedAt?: Date
  verifiedBy?: string
  rejectionReason?: string

  uploadedAt: Date
}

// ============================================
// AUDIT LOG
// ============================================

export interface AuditLogEntry {
  id: string
  adminId: string
  adminName: string
  action: string
  entityType: string
  entityId: string
  details: Record<string, unknown>
  ipAddress: string
  userAgent: string
  createdAt: Date
}

// ============================================
// API RESPONSES
// ============================================

export interface AdminApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: Record<string, string[]>
}

export interface AdminPaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasMore: boolean
}

export interface AdminFilterOptions {
  search?: string
  status?: string[]
  dateFrom?: Date
  dateTo?: Date
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}
