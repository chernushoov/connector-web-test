'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export interface AnalyticsInsight {
  id: string
  type: 'positive' | 'negative' | 'neutral' | 'warning'
  title: string
  description: string
  metric?: string
  change?: number
  recommendation?: string
}

export interface AnalyticsData {
  summary: string
  insights: AnalyticsInsight[]
  recommendations: string[]
  anomalies: string[]
}

interface AIInsightsCardProps {
  metrics: {
    totalUsers: number
    newUsersToday: number
    newUsersThisWeek: number
    activeUsersDaily: number
    activeShifts: number
    pendingShifts: number
    completedShiftsToday: number
    completedShiftsThisWeek: number
    revenueToday: number
    revenueThisWeek: number
    platformFeesCollected: number
    openDisputes: number
    avgResponseTimeHours: number
    avgRating: number
    conversionRate: number
  }
  language?: 'ru' | 'en'
}

export function AIInsightsCard({ metrics, language = 'ru' }: AIInsightsCardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const t = {
    ru: {
      title: 'AI Аналитика',
      subtitle: 'Интеллектуальный анализ метрик',
      analyze: 'Анализировать',
      analyzing: 'Анализирую...',
      refresh: 'Обновить',
      insights: 'Инсайты',
      recommendations: 'Рекомендации',
      anomalies: 'Аномалии',
      showMore: 'Показать больше',
      showLess: 'Скрыть',
      error: 'Ошибка анализа',
      noData: 'Нажмите "Анализировать" для получения AI-инсайтов',
    },
    en: {
      title: 'AI Analytics',
      subtitle: 'Intelligent metrics analysis',
      analyze: 'Analyze',
      analyzing: 'Analyzing...',
      refresh: 'Refresh',
      insights: 'Insights',
      recommendations: 'Recommendations',
      anomalies: 'Anomalies',
      showMore: 'Show more',
      showLess: 'Show less',
      error: 'Analysis error',
      noData: 'Click "Analyze" to get AI insights',
    },
  }[language]

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metrics }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const result: AnalyticsData = await response.json()
      setData(result)
    } catch (err) {
      setError(t.error)
    } finally {
      setIsLoading(false)
    }
  }, [metrics, t.error])

  const getInsightIcon = (type: AnalyticsInsight['type']) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-success" />
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-danger" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />
      default:
        return <CheckCircle className="w-4 h-4 text-neutral-400" />
    }
  }

  const getInsightBgColor = (type: AnalyticsInsight['type']) => {
    switch (type) {
      case 'positive':
        return 'bg-success/5 border-success/20'
      case 'negative':
        return 'bg-danger/5 border-danger/20'
      case 'warning':
        return 'bg-warning/5 border-warning/20'
      default:
        return 'bg-neutral-50 border-neutral-200'
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-brand-primary/10 to-purple-500/10 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-purple-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">{t.title}</h3>
              <p className="text-xs text-neutral-500">{t.subtitle}</p>
            </div>
          </div>
          <Button
            variant={data ? 'ghost' : 'primary'}
            size="sm"
            onClick={fetchAnalytics}
            isLoading={isLoading}
            leftIcon={data ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          >
            {isLoading ? t.analyzing : data ? t.refresh : t.analyze}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="flex items-center gap-2 text-danger text-sm p-3 bg-danger/5 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {!data && !isLoading && !error && (
          <p className="text-neutral-500 text-sm text-center py-6">{t.noData}</p>
        )}

        {data && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="p-3 bg-neutral-50 rounded-xl">
              <p className="text-sm text-neutral-700 whitespace-pre-wrap">{data.summary}</p>
            </div>

            {/* Insights */}
            <div>
              <h4 className="text-sm font-medium text-neutral-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t.insights}
              </h4>
              <div className="space-y-2">
                {data.insights.slice(0, isExpanded ? undefined : 3).map((insight) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border ${getInsightBgColor(insight.type)}`}
                  >
                    <div className="flex items-start gap-2">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900">{insight.title}</p>
                        <p className="text-xs text-neutral-600 mt-0.5">{insight.description}</p>
                        {insight.change !== undefined && (
                          <span className={`text-xs font-medium ${insight.change > 0 ? 'text-success' : 'text-danger'}`}>
                            {insight.change > 0 ? '+' : ''}{insight.change.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {data.insights.length > 3 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-sm text-brand-primary mt-2 hover:underline"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      {t.showLess}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      {t.showMore} ({data.insights.length - 3})
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Recommendations */}
            {data.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-neutral-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-warning" />
                  {t.recommendations}
                </h4>
                <ul className="space-y-1">
                  {data.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-neutral-600">
                      <span className="w-5 h-5 rounded-full bg-warning/10 text-warning flex items-center justify-center flex-shrink-0 text-xs font-medium">
                        {index + 1}
                      </span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Anomalies */}
            {data.anomalies.length > 0 && (
              <div className="p-3 bg-danger/5 border border-danger/20 rounded-lg">
                <h4 className="text-sm font-medium text-danger mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {t.anomalies}
                </h4>
                <ul className="text-sm text-danger/80 space-y-0.5">
                  {data.anomalies.map((anomaly, index) => (
                    <li key={index}>• {anomaly}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
