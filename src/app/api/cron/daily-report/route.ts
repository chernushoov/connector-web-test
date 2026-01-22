// ============================================
// Cron: Daily Report
// Runs daily at 9:00 AM to generate and send report
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getAgent } from '@/lib/agent'
import type { DailyMetrics } from '@/lib/agent'

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const agent = getAgent()
  agent.start()

  try {
    // In production: fetch real metrics from Supabase
    // const today = await fetchTodayMetrics()
    // const yesterday = await fetchYesterdayMetrics()

    const today = new Date().toISOString().split('T')[0]

    // Placeholder metrics - replace with real DB queries
    const todayMetrics: DailyMetrics = {
      date: today,
      registrations: { total: 0, workers: 0, employers: 0, bySource: {} },
      shifts: { created: 0, filled: 0, cancelled: 0, avgTimeToFill: 0 },
      applications: { sent: 0, approved: 0, rejected: 0, avgResponseTime: 0 },
      engagement: { dau: 0, wau: 0, mau: 0, avgSessionDuration: 0 },
      revenue: { total: 0, subscriptions: 0, commissions: 0, newPaidUsers: 0 },
    }

    const report = await agent.generateReport(todayMetrics)

    return NextResponse.json({
      success: true,
      message: 'Daily report generated',
      report: report ? {
        date: report.date,
        insightsCount: report.insights.length,
        alertsCount: report.alerts.length,
        summary: report.summary.substring(0, 200),
      } : null,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

function verifyCronSecret(req: NextRequest): boolean {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  return secret === process.env.CRON_SECRET
}
