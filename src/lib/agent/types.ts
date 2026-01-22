// ============================================
// AI Agent Types
// ============================================

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type AgentModule = 'moderation' | 'notifications' | 'fraud' | 'analytics' | 'reports'

// ============================================
// Task Definition
// ============================================

export interface AgentTask {
  id: string
  module: AgentModule
  name: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  error?: string
  result?: TaskResult
  metadata?: Record<string, unknown>
}

export interface TaskResult {
  success: boolean
  itemsProcessed: number
  itemsFlagged: number
  itemsApproved: number
  itemsRejected: number
  duration: number // ms
  details?: Record<string, unknown>
}

// ============================================
// Moderation Types
// ============================================

export interface ModerationItem {
  id: string
  type: 'shift' | 'profile' | 'review' | 'message'
  content: string
  authorId: string
  createdAt: Date
  metadata?: Record<string, unknown>
}

export interface ModerationResult {
  itemId: string
  isViolation: boolean
  confidence: number // 0-100
  reasons: string[]
  action: 'approve' | 'flag' | 'reject' | 'escalate'
  suggestedResponse?: string
}

export interface ModerationRule {
  id: string
  name: string
  pattern: RegExp | string
  action: ModerationResult['action']
  reason: string
  priority: number
}

// ============================================
// Notification Types
// ============================================

export interface NotificationPayload {
  userId: string
  type: 'new_application' | 'application_approved' | 'application_rejected' |
        'new_shift' | 'shift_reminder' | 'payment_received' | 'review_received' |
        'trial_ending' | 'trial_ended' | 'welcome' | 'reactivation'
  title: string
  body: string
  data?: Record<string, unknown>
  channels: ('push' | 'email' | 'sms')[]
  language: 'ru' | 'en' | 'he' | 'ar'
}

export interface NotificationResult {
  userId: string
  sent: boolean
  channels: {
    push?: { success: boolean; error?: string }
    email?: { success: boolean; error?: string }
    sms?: { success: boolean; error?: string }
  }
}

// ============================================
// Fraud Detection Types
// ============================================

export interface FraudSignal {
  type: 'multi_account' | 'contact_sharing' | 'fake_profile' |
        'suspicious_activity' | 'commercial_disguise' | 'spam'
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number // 0-100
  evidence: string[]
}

export interface FraudCheckResult {
  userId: string
  isSuspicious: boolean
  riskScore: number // 0-100
  signals: FraudSignal[]
  recommendedAction: 'none' | 'flag' | 'restrict' | 'ban'
  details?: Record<string, unknown>
}

// ============================================
// Analytics Types
// ============================================

export interface DailyMetrics {
  date: string // YYYY-MM-DD
  registrations: {
    total: number
    workers: number
    employers: number
    bySource: Record<string, number>
  }
  shifts: {
    created: number
    filled: number
    cancelled: number
    avgTimeToFill: number // hours
  }
  applications: {
    sent: number
    approved: number
    rejected: number
    avgResponseTime: number // hours
  }
  engagement: {
    dau: number
    wau: number
    mau: number
    avgSessionDuration: number // minutes
  }
  revenue: {
    total: number
    subscriptions: number
    commissions: number
    newPaidUsers: number
  }
}

export interface AnalyticsInsight {
  type: 'growth' | 'decline' | 'anomaly' | 'opportunity' | 'risk'
  metric: string
  change: number // percentage
  description: string
  recommendation?: string
  priority: TaskPriority
}

// ============================================
// Report Types
// ============================================

export interface DailyReport {
  date: string
  generatedAt: Date
  metrics: DailyMetrics
  insights: AnalyticsInsight[]
  alerts: ReportAlert[]
  summary: string
}

export interface ReportAlert {
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  actionRequired: boolean
  actionUrl?: string
}

// ============================================
// Agent Config
// ============================================

export interface AgentConfig {
  enabled: boolean
  modules: {
    moderation: {
      enabled: boolean
      autoApprove: boolean
      autoRejectThreshold: number // confidence %
      escalateThreshold: number // confidence %
    }
    notifications: {
      enabled: boolean
      batchSize: number
      rateLimitPerUser: number // per hour
    }
    fraud: {
      enabled: boolean
      scanInterval: number // hours
      autoRestrictThreshold: number // risk score
      autoBanThreshold: number // risk score
    }
    analytics: {
      enabled: boolean
      reportTime: string // HH:MM
      telegramChatId?: string
      emailRecipients?: string[]
    }
  }
  openai: {
    apiKey?: string
    model: string
    maxTokens: number
    temperature: number
  }
}

// ============================================
// Logging
// ============================================

export interface AgentLog {
  id: string
  timestamp: Date
  module: AgentModule
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  taskId?: string
  metadata?: Record<string, unknown>
}
