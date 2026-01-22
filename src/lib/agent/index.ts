// ============================================
// AI Agent - Main Entry Point
// Connector 24/7 Automation Agent
// ============================================

export { TaskRunner, getTaskRunner, sleep, retry, formatDuration } from './task-runner'
export { AGENT_CONFIG, MODERATION_RULES, FRAUD_SIGNALS, NOTIFICATION_TEMPLATES, ANALYTICS_THRESHOLDS } from './config'

// Module exports
export { ModerationModule } from './modules/moderation'
export { NotificationsModule } from './modules/notifications'
export { FraudDetectionModule as FraudModule } from './modules/fraud-detection'
export { ReportsModule } from './modules/reports'

// Type exports
export type {
  AgentTask,
  TaskResult,
  TaskStatus,
  TaskPriority,
  AgentModule,
  AgentLog,
  AgentConfig,
  ModerationItem,
  ModerationResult,
  ModerationRule,
  NotificationPayload,
  NotificationResult,
  FraudSignal,
  FraudCheckResult,
  DailyMetrics,
  DailyReport,
  AnalyticsInsight,
  ReportAlert,
} from './types'

// ============================================
// Agent Orchestrator
// ============================================

import { getTaskRunner } from './task-runner'
import { AGENT_CONFIG } from './config'
import { ModerationModule } from './modules/moderation'
import { FraudDetectionModule } from './modules/fraud-detection'
import { ReportsModule } from './modules/reports'
import { NotificationsModule } from './modules/notifications'
import type { ModerationItem, DailyMetrics } from './types'

/**
 * Main Agent class - orchestrates all modules
 */
export class ConnectorAgent {
  private runner = getTaskRunner()
  private started = false

  get isRunning() {
    return this.started
  }

  /**
   * Start the agent
   */
  start(): void {
    if (!AGENT_CONFIG.enabled) {
      this.runner.log('warn', 'analytics', 'Agent is disabled in config')
      return
    }

    this.started = true
    this.runner.log('info', 'analytics', 'Connector Agent started')
  }

  /**
   * Stop the agent
   */
  stop(): void {
    this.started = false
    this.runner.log('info', 'analytics', 'Connector Agent stopped')
  }

  // ============================================
  // Moderation
  // ============================================

  async moderateContent(items: ModerationItem[]) {
    if (!this.started || !AGENT_CONFIG.modules.moderation.enabled) return null
    return ModerationModule.moderateBatch(items)
  }

  async moderateShift(shift: Parameters<typeof ModerationModule.moderateShift>[0]) {
    if (!this.started || !AGENT_CONFIG.modules.moderation.enabled) return null
    return ModerationModule.moderateShift(shift)
  }

  async moderateProfile(profile: Parameters<typeof ModerationModule.moderateProfile>[0]) {
    if (!this.started || !AGENT_CONFIG.modules.moderation.enabled) return null
    return ModerationModule.moderateProfile(profile)
  }

  async moderateMessage(message: Parameters<typeof ModerationModule.moderateMessage>[0]) {
    if (!this.started || !AGENT_CONFIG.modules.moderation.enabled) return null
    return ModerationModule.moderateMessage(message)
  }

  // ============================================
  // Fraud Detection
  // ============================================

  async checkUserFraud(
    profile: Parameters<typeof FraudDetectionModule.checkUser>[0],
    activity: Parameters<typeof FraudDetectionModule.checkUser>[1],
    allUsers?: Parameters<typeof FraudDetectionModule.checkUser>[2]
  ) {
    if (!this.started || !AGENT_CONFIG.modules.fraud.enabled) return null
    return FraudDetectionModule.checkUser(profile, activity, allUsers)
  }

  async scanUsersFraud(users: Parameters<typeof FraudDetectionModule.scanUsers>[0]) {
    if (!this.started || !AGENT_CONFIG.modules.fraud.enabled) return null
    return FraudDetectionModule.scanUsers(users)
  }

  // ============================================
  // Notifications
  // ============================================

  async notify(payload: Parameters<typeof NotificationsModule.sendNotification>[0]) {
    if (!this.started || !AGENT_CONFIG.modules.notifications.enabled) return null
    return NotificationsModule.sendNotification(payload)
  }

  async notifyBatch(payloads: Parameters<typeof NotificationsModule.sendBatch>[0]) {
    if (!this.started || !AGENT_CONFIG.modules.notifications.enabled) return null
    return NotificationsModule.sendBatch(payloads)
  }

  // ============================================
  // Reports
  // ============================================

  async generateReport(today: DailyMetrics, yesterday?: DailyMetrics) {
    if (!this.started || !AGENT_CONFIG.modules.analytics.enabled) return null
    const report = await ReportsModule.generateDailyReport(today, yesterday)
    await ReportsModule.sendToTelegram(report)
    return report
  }

  // ============================================
  // Stats
  // ============================================

  getStats() {
    return this.runner.getStats()
  }

  getLogs(module?: Parameters<typeof this.runner.getLogs>[0], level?: Parameters<typeof this.runner.getLogs>[1]) {
    return this.runner.getLogs(module, level)
  }

  cleanup(olderThanHours = 24) {
    return this.runner.clearOldTasks(olderThanHours)
  }
}

// ============================================
// Singleton
// ============================================

let agentInstance: ConnectorAgent | null = null

export function getAgent(): ConnectorAgent {
  if (!agentInstance) {
    agentInstance = new ConnectorAgent()
  }
  return agentInstance
}
