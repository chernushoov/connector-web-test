// ============================================
// AI Agent - Daily Reports Module
// Generates daily analytics reports and sends to Telegram/Email
// ============================================

import { DailyMetrics, DailyReport, AnalyticsInsight, ReportAlert, TaskResult } from '../types'
import { AGENT_CONFIG, ANALYTICS_THRESHOLDS } from '../config'
import { getTaskRunner } from '../task-runner'

/**
 * Generate daily report from metrics
 */
export async function generateDailyReport(
  today: DailyMetrics,
  yesterday?: DailyMetrics
): Promise<DailyReport> {
  const runner = getTaskRunner()
  const task = runner.createTask('reports', 'Daily report', 'Generating daily report', 'medium')
  const startTime = Date.now()

  const insights = analyzeMetrics(today, yesterday)
  const alerts = generateAlerts(today, yesterday)
  const summary = buildSummary(today, insights, alerts)

  const report: DailyReport = {
    date: today.date,
    generatedAt: new Date(),
    metrics: today,
    insights,
    alerts,
    summary,
  }

  runner.updateTaskStatus(task.id, 'completed', {
    success: true, itemsProcessed: 1, itemsFlagged: alerts.filter(a => a.type === 'warning' || a.type === 'error').length,
    itemsApproved: 1, itemsRejected: 0, duration: Date.now() - startTime,
  })

  return report
}

/**
 * Analyze metrics and generate insights
 */
function analyzeMetrics(today: DailyMetrics, yesterday?: DailyMetrics): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = []
  if (!yesterday) return insights

  // Registration trends
  const regChange = percentChange(yesterday.registrations.total, today.registrations.total)
  if (Math.abs(regChange) > 10) {
    insights.push({
      type: regChange > 0 ? 'growth' : 'decline',
      metric: 'registrations',
      change: regChange,
      description: `Registrations ${regChange > 0 ? 'grew' : 'dropped'} by ${Math.abs(regChange).toFixed(0)}%`,
      recommendation: regChange < -20 ? 'Check acquisition channels and landing page' : undefined,
      priority: Math.abs(regChange) > 30 ? 'high' : 'medium',
    })
  }

  // Application trends
  const appChange = percentChange(yesterday.applications.sent, today.applications.sent)
  if (Math.abs(appChange) > 15) {
    insights.push({
      type: appChange > 0 ? 'growth' : 'decline',
      metric: 'applications',
      change: appChange,
      description: `Applications ${appChange > 0 ? 'grew' : 'dropped'} by ${Math.abs(appChange).toFixed(0)}%`,
      recommendation: appChange < -30 ? 'Check if shifts are relevant and visible to workers' : undefined,
      priority: Math.abs(appChange) > 40 ? 'high' : 'medium',
    })
  }

  // Fill rate
  if (today.shifts.created > 0) {
    const fillRate = (today.shifts.filled / today.shifts.created) * 100
    if (fillRate > ANALYTICS_THRESHOLDS.highlights.fillRatePercent) {
      insights.push({
        type: 'growth',
        metric: 'fill_rate',
        change: fillRate,
        description: `Fill rate is ${fillRate.toFixed(0)}% - excellent demand/supply balance`,
        priority: 'low',
      })
    } else if (fillRate < 30) {
      insights.push({
        type: 'risk',
        metric: 'fill_rate',
        change: fillRate,
        description: `Fill rate is only ${fillRate.toFixed(0)}% - need more workers in active regions`,
        recommendation: 'Focus recruitment on areas with unfilled shifts',
        priority: 'high',
      })
    }
  }

  // Response time
  if (today.applications.avgResponseTime > ANALYTICS_THRESHOLDS.alerts.avgResponseTimeHours) {
    insights.push({
      type: 'risk',
      metric: 'response_time',
      change: today.applications.avgResponseTime,
      description: `Average employer response time is ${today.applications.avgResponseTime.toFixed(0)}h - too slow`,
      recommendation: 'Send reminders to employers with pending applications',
      priority: 'high',
    })
  }

  // Revenue
  const revChange = percentChange(yesterday.revenue.total, today.revenue.total)
  if (Math.abs(revChange) > 15) {
    insights.push({
      type: revChange > 0 ? 'growth' : 'decline',
      metric: 'revenue',
      change: revChange,
      description: `Revenue ${revChange > 0 ? 'grew' : 'dropped'} by ${Math.abs(revChange).toFixed(0)}%`,
      priority: revChange < -20 ? 'critical' : 'medium',
    })
  }

  return insights
}

/**
 * Generate alerts from metrics
 */
function generateAlerts(today: DailyMetrics, yesterday?: DailyMetrics): ReportAlert[] {
  const alerts: ReportAlert[] = []
  const thresholds = ANALYTICS_THRESHOLDS.alerts

  if (yesterday) {
    const regDrop = percentChange(yesterday.registrations.total, today.registrations.total)
    if (regDrop < -thresholds.registrationDropPercent) {
      alerts.push({
        type: 'warning', title: 'Registration drop',
        message: `Registrations dropped ${Math.abs(regDrop).toFixed(0)}% vs yesterday`,
        actionRequired: true,
      })
    }

    const revDrop = percentChange(yesterday.revenue.total, today.revenue.total)
    if (revDrop < -thresholds.revenueDropPercent) {
      alerts.push({
        type: 'error', title: 'Revenue drop',
        message: `Revenue dropped ${Math.abs(revDrop).toFixed(0)}% vs yesterday`,
        actionRequired: true,
      })
    }
  }

  if (today.applications.avgResponseTime > thresholds.avgResponseTimeHours) {
    alerts.push({
      type: 'warning', title: 'Slow response time',
      message: `Employers take ${today.applications.avgResponseTime.toFixed(0)}h to respond`,
      actionRequired: true,
    })
  }

  // Positive alerts
  if (today.revenue.newPaidUsers > 5) {
    alerts.push({
      type: 'success', title: 'New paid users',
      message: `${today.revenue.newPaidUsers} new paid subscriptions today!`,
      actionRequired: false,
    })
  }

  return alerts
}

/**
 * Build human-readable summary
 */
function buildSummary(today: DailyMetrics, insights: AnalyticsInsight[], alerts: ReportAlert[]): string {
  const lines: string[] = []

  lines.push(`📊 Daily Report: ${today.date}`)
  lines.push('')
  lines.push(`👥 Users: ${today.engagement.dau} DAU | ${today.registrations.total} new (${today.registrations.workers}W + ${today.registrations.employers}E)`)
  lines.push(`📋 Shifts: ${today.shifts.created} created, ${today.shifts.filled} filled`)
  lines.push(`📨 Applications: ${today.applications.sent} sent, ${today.applications.approved} approved`)
  lines.push(`💰 Revenue: ₪${today.revenue.total} (${today.revenue.newPaidUsers} new paid)`)

  if (insights.length > 0) {
    lines.push('')
    lines.push('📈 Insights:')
    for (const insight of insights.slice(0, 5)) {
      const icon = insight.type === 'growth' ? '🟢' : insight.type === 'decline' ? '🔴' : insight.type === 'risk' ? '⚠️' : '💡'
      lines.push(`${icon} ${insight.description}`)
    }
  }

  if (alerts.filter(a => a.actionRequired).length > 0) {
    lines.push('')
    lines.push('🚨 Alerts:')
    for (const alert of alerts.filter(a => a.actionRequired)) {
      lines.push(`- ${alert.message}`)
    }
  }

  return lines.join('\n')
}

/**
 * Send report to Telegram
 */
export async function sendToTelegram(report: DailyReport): Promise<boolean> {
  const chatId = AGENT_CONFIG.modules.analytics.telegramChatId
  if (!chatId) return false

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return false

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: report.summary, parse_mode: 'Markdown' }),
    })
    return response.ok
  } catch {
    return false
  }
}

function percentChange(prev: number, curr: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0
  return ((curr - prev) / prev) * 100
}

export const ReportsModule = { generateDailyReport, sendToTelegram }
