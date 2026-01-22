'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface EarningsData {
  date: string
  amount: number
  shifts: number
}

interface EarningsChartProps {
  data: EarningsData[]
  period?: 'week' | 'month' | 'year'
  className?: string
}

export function EarningsChart({ data, period = 'week', className }: EarningsChartProps) {
  const { language, isRTL } = useUI()

  const stats = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.amount, 0)
    const avgPerDay = total / data.length || 0
    const totalShifts = data.reduce((sum, d) => sum + d.shifts, 0)
    const maxAmount = Math.max(...data.map(d => d.amount), 1)

    // Calculate trend
    const halfLength = Math.floor(data.length / 2)
    const firstHalf = data.slice(0, halfLength).reduce((sum, d) => sum + d.amount, 0)
    const secondHalf = data.slice(halfLength).reduce((sum, d) => sum + d.amount, 0)
    const trendPercent = firstHalf > 0
      ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100)
      : 0

    return { total, avgPerDay, totalShifts, maxAmount, trendPercent }
  }, [data])

  const getTrendIcon = () => {
    if (stats.trendPercent > 0) return <TrendingUp className="w-4 h-4" />
    if (stats.trendPercent < 0) return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  const getTrendColor = () => {
    if (stats.trendPercent > 0) return 'text-success'
    if (stats.trendPercent < 0) return 'text-danger'
    return 'text-neutral-500'
  }

  return (
    <div className={cn('bg-white rounded-2xl p-4', className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-neutral-500">{t('profile.earned', language as any)}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900">
              ₪{stats.total.toLocaleString()}
            </span>
            <span className={cn('flex items-center gap-1 text-sm font-medium', getTrendColor())}>
              {getTrendIcon()}
              {Math.abs(stats.trendPercent)}%
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-neutral-500">{stats.totalShifts} shifts</p>
          <p className="text-sm text-neutral-400">
            Avg ₪{Math.round(stats.avgPerDay)}/day
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-32 flex items-end gap-1" dir="ltr">
        {data.map((item, index) => {
          const heightPercent = (item.amount / stats.maxAmount) * 100
          const isToday = index === data.length - 1

          return (
            <div
              key={item.date}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPercent}%` }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={cn(
                  'w-full rounded-t-md min-h-[4px]',
                  isToday
                    ? 'bg-gradient-brand'
                    : item.amount > 0
                      ? 'bg-brand-primary/60'
                      : 'bg-neutral-200'
                )}
              />
              <span className="text-[10px] text-neutral-400">
                {formatDayLabel(item.date, period)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-neutral-100">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-sm bg-gradient-brand" />
          <span className="text-neutral-600">{t('time.today', language as any)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-sm bg-brand-primary/60" />
          <span className="text-neutral-600">Previous days</span>
        </div>
      </div>
    </div>
  )
}

function formatDayLabel(dateStr: string, period: string): string {
  const date = new Date(dateStr)

  if (period === 'week') {
    return date.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2)
  }
  if (period === 'month') {
    return date.getDate().toString()
  }
  return date.toLocaleDateString('en', { month: 'short' }).slice(0, 3)
}

// Summary card component
export function EarningsSummary({ className }: { className?: string }) {
  const { language, isRTL } = useUI()

  // Mock data
  const summaryData = {
    thisWeek: 2450,
    lastWeek: 2100,
    thisMonth: 8750,
    totalEarned: 45200,
    pendingPayout: 650,
  }

  const weekChange = Math.round(((summaryData.thisWeek - summaryData.lastWeek) / summaryData.lastWeek) * 100)

  return (
    <div className={cn('grid grid-cols-2 gap-3', className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-brand text-white p-4 rounded-2xl"
      >
        <p className="text-sm opacity-80">This week</p>
        <p className="text-2xl font-bold mt-1">₪{summaryData.thisWeek.toLocaleString()}</p>
        <div className={cn(
          'flex items-center gap-1 mt-2 text-sm',
          weekChange >= 0 ? 'text-success-light' : 'text-danger-light'
        )}>
          {weekChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(weekChange)}% vs last week
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-brand-accent text-neutral-900 p-4 rounded-2xl"
      >
        <p className="text-sm opacity-80">Pending payout</p>
        <p className="text-2xl font-bold mt-1">₪{summaryData.pendingPayout.toLocaleString()}</p>
        <p className="text-sm mt-2 opacity-70">Next Tuesday</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-neutral-100 p-4 rounded-2xl"
      >
        <p className="text-sm text-neutral-500">This month</p>
        <p className="text-xl font-bold text-neutral-900 mt-1">
          ₪{summaryData.thisMonth.toLocaleString()}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-neutral-100 p-4 rounded-2xl"
      >
        <p className="text-sm text-neutral-500">Total earned</p>
        <p className="text-xl font-bold text-neutral-900 mt-1">
          ₪{summaryData.totalEarned.toLocaleString()}
        </p>
      </motion.div>
    </div>
  )
}

export default EarningsChart
