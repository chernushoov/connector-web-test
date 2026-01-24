// ============================================
// CONNECTOR 2.0 - Type Definitions
// ============================================

// ============================================
// ENUMS
// ============================================

export type Language = 'ru' | 'he' | 'en' | 'ar'

export type UserMode = 'free-world' | 'worker' | 'employer'

export type UserRole = 'worker' | 'employer'

export type AvailabilityStatus = 'available' | 'busy' | 'offline'

export type WorkerAvailability = 'now' | 'today' | 'tomorrow' | 'flexible'

export type ShiftUrgency = 'instant' | 'today' | 'scheduled'

export type ShiftStatus = 'open' | 'matched' | 'in_progress' | 'completed' | 'cancelled'

export type TaskFlowStatus =
  | 'applied'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'upcoming'
  | 'in_progress'
  | 'completed'
  | 'awaiting_review'
  | 'reviewed'
  | 'payment_pending'
  | 'paid'
  | 'cancelled'
  | 'disputed'

export type PaymentStatus = 'pending' | 'processing' | 'escrowed' | 'released' | 'disputed' | 'failed'

export type DocumentType = 'passport' | 'work_permit' | 'driver_license' | 'other'

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

export type SubscriptionPlan = 'free' | 'pro' | 'business'

export type TrialStatus = 'not_started' | 'active' | 'ending_soon' | 'ended'

export type UserSubscriptionState =
  | 'anonymous'
  | 'trial_active'
  | 'trial_ended'
  | 'subscribed'
  | 'free_limited'

export type DayFilter = 'all' | 'today' | 'tomorrow' | 'week'

// ============================================
// COORDINATES & LOCATION
// ============================================

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface Location {
  latitude?: number
  longitude?: number
  address?: string
  city?: string
  distance?: number // km from user
}

// ============================================
// USER MODELS
// ============================================

export interface BaseUser {
  id: string
  phone: string
  name: string
  photoUrl?: string
  createdAt: Date
  updatedAt: Date
  language: Language
  isVerified: boolean
  verificationStatus: VerificationStatus
}

export interface QuickProfile extends BaseUser {
  // Minimal profile for Free World
  skills: string[]
  location?: Location
  availabilityStatus: AvailabilityStatus
  availableUntil?: Date
  rating: number
  reviewCount: number
  hourlyRate?: number
}

export interface WorkerProfile extends QuickProfile {
  // Full worker profile
  age?: number
  city: string
  specialization: string
  experience: number // years
  about?: string
  hasCar: boolean
  hasTools: boolean
  teamSize: number // 0 = solo, 1+ = can bring people
  availability: WorkerAvailability
  minRate: number
  maxRate: number
  documents: WorkerDocument[]
  portfolio: PortfolioItem[]
  completedShifts: number
  totalEarned: number
  totalHours: number
  reliabilityScore: number // 0-100
  responseTime: number // minutes
  onTimeRate: number // 0-1
  languages: string[]
  isPro: boolean
  proExpiresAt?: Date
}

export interface EmployerProfile extends BaseUser {
  company: string
  contactPerson: string
  city: string
  industry: string
  plan: SubscriptionPlan
  planExpiresAt?: Date
  shiftsPosted: number
  shiftsCompleted: number
  totalPaid: number
  rating: number
  reviewCount: number
}

// ============================================
// WORKER DOCUMENTS & PORTFOLIO
// ============================================

export interface WorkerDocument {
  id: string
  type: DocumentType
  imageUrl?: string
  uploadDate: Date
  verificationStatus: VerificationStatus
  verifiedAt?: Date
}

export interface PortfolioItem {
  id: string
  imageUrl: string
  caption?: string
  date: Date
}

// ============================================
// SHIFTS & TASKS
// ============================================

export interface ShiftRequirements {
  needsCar: boolean
  needsTools: boolean
  needsTeam: number // how many people needed
  minExperience: number // years
  minRating: number
  specialization?: string
}

export interface ShiftPosting {
  id: string
  // Basic info
  title: string
  description?: string
  employer: {
    id: string
    name: string
    company: string
    phone: string
    rating: number
    reviewCount: number
    totalPaid: number
    isVerified: boolean
  }
  // Location
  location: Location
  city: string
  // Time
  date: Date
  startTime: string
  endTime: string
  urgency: ShiftUrgency
  // Money
  baseRate: number // per hour
  surgeMultiplier: number
  totalEstimate: number
  paymentGuarantee: boolean
  // Capacity
  slots: number
  filled: number
  applicants: number
  // Requirements
  requirements: ShiftRequirements
  requiredSkills: string[]
  // Status & flags
  status: ShiftStatus
  isInstant: boolean
  acceptsTeams: boolean
  hasEscrow: boolean
  hasInsurance: boolean
  // Rating
  workplaceRating: number
  // Meta
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
  // Psychology triggers
  viewCount: number
  lastAppliedAt?: Date
}

export interface QuickTask {
  id: string
  // Basic
  title: string
  description?: string
  // Creator
  creator: {
    id: string
    name: string
    phone: string
    photoUrl?: string
    isVerified: boolean
  }
  // Location
  location: Location
  // Time
  when: 'now' | 'today' | 'tomorrow' | Date
  duration?: number // hours
  // Money
  amount: number
  isNegotiable: boolean
  // Status
  status: 'open' | 'taken' | 'completed' | 'cancelled'
  // Meta
  createdAt: Date
  expiresAt?: Date
  // Psychology
  viewCount: number
  responseCount: number
}

// ============================================
// TASK FLOW (Full lifecycle)
// ============================================

export interface TaskFlow {
  id: string
  shiftId: string
  shift: ShiftPosting
  workerId: string
  worker?: WorkerProfile
  status: TaskFlowStatus
  // Timeline
  appliedAt: Date
  reviewedAt?: Date
  approvedAt?: Date
  startedAt?: Date
  completedAt?: Date
  paidAt?: Date
  // Reviews
  workerRating?: number
  workerReview?: string
  employerRating?: number
  employerReview?: string
  // Payment
  agreedRate: number
  hoursWorked?: number
  totalAmount?: number
  paymentStatus: PaymentStatus
  // Meta
  createdAt: Date
  updatedAt: Date
}

// ============================================
// SMART MATCH
// ============================================

export interface MatchCriteria {
  id: string
  name: string
  icon: string
  matched: boolean
  weight: number
  detail: string
}

export interface MatchResult {
  shift: ShiftPosting
  matchPercent: number
  matchDetails: MatchCriteria[]
}

// ============================================
// REVIEWS
// ============================================

export interface Review {
  id: string
  authorId: string
  authorName: string
  authorPhotoUrl?: string
  targetId: string
  targetType: 'worker' | 'employer'
  rating: number // 1-5
  comment: string
  shiftId?: string
  shiftTitle?: string
  isFromEmployer: boolean
  createdAt: Date
}

// ============================================
// PAYMENTS & ESCROW
// ============================================

export interface EscrowTransaction {
  id: string
  shiftId: string
  workerId: string
  workerName: string
  employerId: string
  amount: number
  platformFee: number
  status: PaymentStatus
  createdAt: Date
  releasedAt?: Date
}

export interface Subscription {
  plan: SubscriptionPlan
  isActive: boolean
  startDate: Date
  endDate: Date
  autoRenew: boolean
  price: number
}

export interface TrialInfo {
  status: TrialStatus
  startedAt: Date | null
  endsAt: Date | null
  daysRemaining: number
  hoursRemaining: number
  stats: {
    earnings: number
    shiftsCompleted: number
    applicationsApproved: number
    profileViews: number
  }
}

export interface PricingPlan {
  id: SubscriptionPlan
  name: string
  price: number
  period: 'month' | 'year'
  features: string[]
  limitations?: string[]
  isPopular?: boolean
  savings?: number
}

// ============================================
// REFERRAL
// ============================================

export interface Referral {
  id: string
  referredUserId: string
  referredUserName: string
  referredDate: Date
  bonusEarned: number
  status: 'pending' | 'completed' | 'expired'
}

// ============================================
// NOTIFICATIONS
// ============================================

export interface Notification {
  id: string
  type: 'match' | 'application' | 'approval' | 'payment' | 'review' | 'urgent' | 'promo'
  title: string
  body: string
  data?: Record<string, unknown>
  read: boolean
  createdAt: Date
}

// ============================================
// MAP & UI
// ============================================

export interface MapMarker {
  id: string
  type: 'worker' | 'task' | 'employer'
  coordinates: Coordinates
  data: QuickProfile | QuickTask | ShiftPosting
  isUrgent?: boolean
  isPro?: boolean
  isAvailable?: boolean
}

export interface MapRegion {
  center: Coordinates
  zoom: number
  bounds?: {
    ne: Coordinates
    sw: Coordinates
  }
}

export interface FilterState {
  search: string
  day: DayFilter
  maxDistance: number
  minRate?: number
  maxRate?: number
  instantOnly: boolean
  teamsOnly: boolean
  verifiedOnly: boolean
  skills?: string[]
  urgency?: ShiftUrgency[]
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============================================
// PSYCHOLOGY TRIGGERS
// ============================================

export interface UrgencyTrigger {
  type: 'countdown' | 'scarcity' | 'demand' | 'competition'
  message: string
  value?: number
  expiresAt?: Date
}

export interface SocialProof {
  type: 'viewers' | 'applicants' | 'completed' | 'earnings'
  count: number
  message: string
  avatars?: string[]
}

export interface LossAversion {
  potentialLoss: number
  message: string
  comparison?: string
}
