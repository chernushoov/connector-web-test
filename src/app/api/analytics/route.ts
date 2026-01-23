// ============================================
// AI Analytics API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { AI_CONFIG } from '@/lib/ai'

export interface MetricsData {
  // User metrics
  totalUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  activeUsersDaily: number

  // Shift metrics
  activeShifts: number
  pendingShifts: number
  completedShiftsToday: number
  completedShiftsThisWeek: number

  // Financial metrics
  revenueToday: number
  revenueThisWeek: number
  platformFeesCollected: number

  // Quality metrics
  openDisputes: number
  avgResponseTimeHours: number
  avgRating: number
  conversionRate: number

  // Previous period for comparison
  previousPeriod?: {
    totalUsers: number
    newUsers: number
    activeUsers: number
    revenue: number
    completedShifts: number
    openDisputes: number
  }
}

export interface AnalyticsInsight {
  id: string
  type: 'positive' | 'negative' | 'neutral' | 'warning'
  title: string
  description: string
  metric?: string
  change?: number
  recommendation?: string
}

export interface AnalyticsResponse {
  summary: string
  insights: AnalyticsInsight[]
  recommendations: string[]
  anomalies: string[]
}

// Analyze metrics and generate insights without AI
function analyzeMetricsBasic(data: MetricsData): AnalyticsResponse {
  const insights: AnalyticsInsight[] = []
  const recommendations: string[] = []
  const anomalies: string[] = []

  const prev = data.previousPeriod

  // User growth analysis
  if (prev) {
    const userGrowth = ((data.totalUsers - prev.totalUsers) / prev.totalUsers) * 100
    insights.push({
      id: 'user-growth',
      type: userGrowth > 5 ? 'positive' : userGrowth < -5 ? 'negative' : 'neutral',
      title: userGrowth > 0 ? 'User Growth' : 'User Decline',
      description: `Users ${userGrowth > 0 ? 'increased' : 'decreased'} by ${Math.abs(userGrowth).toFixed(1)}% compared to previous period`,
      metric: 'totalUsers',
      change: userGrowth,
    })

    if (userGrowth < 0) {
      recommendations.push('Consider running a user acquisition campaign or promotions to boost registrations')
    }
  }

  // Active users analysis
  const activeUserRate = (data.activeUsersDaily / data.totalUsers) * 100
  if (activeUserRate < 10) {
    insights.push({
      id: 'low-engagement',
      type: 'warning',
      title: 'Low User Engagement',
      description: `Only ${activeUserRate.toFixed(1)}% of users are active daily`,
      metric: 'activeUsersDaily',
      recommendation: 'Send re-engagement emails or push notifications to inactive users',
    })
    recommendations.push('Implement push notifications for new shifts matching user preferences')
  }

  // Conversion rate analysis
  if (data.conversionRate < 20) {
    insights.push({
      id: 'low-conversion',
      type: 'warning',
      title: 'Low Conversion Rate',
      description: `Conversion rate is ${data.conversionRate}%, below the 20% target`,
      metric: 'conversionRate',
    })
    recommendations.push('Optimize onboarding flow and reduce friction in the application process')
  } else if (data.conversionRate > 40) {
    insights.push({
      id: 'high-conversion',
      type: 'positive',
      title: 'Excellent Conversion Rate',
      description: `Conversion rate of ${data.conversionRate}% is above average`,
      metric: 'conversionRate',
    })
  }

  // Dispute analysis
  if (data.openDisputes > 10) {
    insights.push({
      id: 'high-disputes',
      type: 'negative',
      title: 'High Number of Open Disputes',
      description: `${data.openDisputes} disputes require attention`,
      metric: 'openDisputes',
    })
    recommendations.push('Prioritize dispute resolution to maintain platform trust')
    anomalies.push(`Unusually high number of disputes (${data.openDisputes})`)
  }

  // Response time analysis
  if (data.avgResponseTimeHours > 24) {
    insights.push({
      id: 'slow-response',
      type: 'warning',
      title: 'Slow Response Time',
      description: `Average response time is ${data.avgResponseTimeHours.toFixed(1)} hours`,
      metric: 'avgResponseTimeHours',
    })
    recommendations.push('Implement automated responses or hire additional support staff')
  }

  // Pending shifts analysis
  if (data.pendingShifts > 20) {
    insights.push({
      id: 'pending-moderation',
      type: 'warning',
      title: 'Moderation Backlog',
      description: `${data.pendingShifts} shifts waiting for moderation`,
      metric: 'pendingShifts',
    })
    recommendations.push('Use AI moderation to speed up the review process')
  }

  // Revenue trend
  if (prev && data.revenueThisWeek < prev.revenue * 0.8) {
    insights.push({
      id: 'revenue-drop',
      type: 'negative',
      title: 'Revenue Decline',
      description: 'Weekly revenue dropped by more than 20%',
      metric: 'revenueThisWeek',
      change: ((data.revenueThisWeek - prev.revenue) / prev.revenue) * 100,
    })
    anomalies.push('Significant revenue drop detected')
    recommendations.push('Analyze which user segments have reduced activity and target them')
  }

  // Rating analysis
  if (data.avgRating < 4.0) {
    insights.push({
      id: 'low-rating',
      type: 'warning',
      title: 'Platform Rating Below Target',
      description: `Average rating is ${data.avgRating.toFixed(1)}, target is 4.0+`,
      metric: 'avgRating',
    })
    recommendations.push('Reach out to users with negative reviews to understand issues')
  }

  // Generate summary
  const positiveCount = insights.filter(i => i.type === 'positive').length
  const negativeCount = insights.filter(i => i.type === 'negative').length
  const warningCount = insights.filter(i => i.type === 'warning').length

  let summary = ''
  if (positiveCount > negativeCount + warningCount) {
    summary = `Platform is performing well with ${positiveCount} positive indicators. `
  } else if (negativeCount > positiveCount) {
    summary = `Attention needed: ${negativeCount} negative indicators detected. `
  } else {
    summary = `Mixed performance: ${positiveCount} positive, ${warningCount} warnings, ${negativeCount} negative. `
  }

  if (recommendations.length > 0) {
    summary += `${recommendations.length} recommendations available.`
  }

  return {
    summary,
    insights,
    recommendations,
    anomalies,
  }
}

// AI-powered analytics
async function analyzeMetricsAI(data: MetricsData, basicAnalysis: AnalyticsResponse): Promise<AnalyticsResponse> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return basicAnalysis
  }

  try {
    const prompt = `${AI_CONFIG.analytics.systemPrompt}

Данные платформы:
- Всего пользователей: ${data.totalUsers} (новых за неделю: ${data.newUsersThisWeek})
- Активных ежедневно: ${data.activeUsersDaily}
- Активных смен: ${data.activeShifts}, на модерации: ${data.pendingShifts}
- Завершено смен за неделю: ${data.completedShiftsThisWeek}
- Выручка за неделю: ₪${data.revenueThisWeek}
- Комиссия платформы: ₪${data.platformFeesCollected}
- Открытых споров: ${data.openDisputes}
- Средний рейтинг: ${data.avgRating}
- Конверсия: ${data.conversionRate}%
- Время ответа: ${data.avgResponseTimeHours}h

Предварительный анализ выявил:
${basicAnalysis.insights.map(i => `- ${i.title}: ${i.description}`).join('\n')}

Дай краткий анализ (на русском):
1. Главный вывод (1 предложение)
2. Топ-3 приоритетных действия
3. Что следует отслеживать`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.5,
      }),
    })

    if (!response.ok) {
      return basicAnalysis
    }

    const aiData = await response.json()
    const aiSummary = aiData.choices?.[0]?.message?.content

    if (aiSummary) {
      return {
        ...basicAnalysis,
        summary: aiSummary,
      }
    }

    return basicAnalysis

  } catch (error) {
    console.error('AI analytics error:', error)
    return basicAnalysis
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: { metrics: MetricsData } = await request.json()
    const { metrics } = body

    if (!metrics) {
      return NextResponse.json(
        { error: 'Metrics data is required' },
        { status: 400 }
      )
    }

    // Basic analysis
    const basicAnalysis = analyzeMetricsBasic(metrics)

    // AI-enhanced analysis
    const analysis = await analyzeMetricsAI(metrics, basicAnalysis)

    return NextResponse.json(analysis)

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Analytics failed' },
      { status: 500 }
    )
  }
}
