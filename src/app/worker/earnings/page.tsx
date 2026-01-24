'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useWorker } from '@/store'
import { t } from '@/i18n/translations'
import { Header, Navigation } from '@/components/shared'
import { EarningsChart, EarningsSummary } from '@/components/worker'
import { Card } from '@/components/ui/Card'
import {
  DollarSign,
  TrendingUp,
  Clock,
  Briefcase,
  ChevronRight
} from 'lucide-react'

type Period = 'week' | 'month' | 'year'

interface Transaction {
  id: string
  type: string
  title: string
  employer: string
  amount: number
  date: Date
  status: string
}

interface EarningsData {
  date: string
  amount: number
  shifts: number
}

export default function EarningsPage() {
  const { language, isRTL } = useUI()
  const { totalEarned, completedShifts } = useWorker()

  const [period, setPeriod] = useState<Period>('week')
  const [earningsData, setEarningsData] = useState<EarningsData[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch earnings data from API
  useEffect(() => {
    async function fetchEarnings() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/analytics?period=${period}`)
        if (res.ok) {
          const data = await res.json()
          setEarningsData(data.chartData || [])
          setTransactions(
            (data.transactions || []).map((tx: Record<string, unknown>) => ({
              ...tx,
              date: new Date(tx.date as string),
            }))
          )
        }
      } catch {
        // API not available yet — show empty state
      } finally {
        setIsLoading(false)
      }
    }
    fetchEarnings()
  }, [period])

  return (
    <div
      className="min-h-screen bg-neutral-50 pb-20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Header
        title={t('profile.earned', language as any)}
        showBack
      />

      <main className="px-4 py-4 space-y-6">
        {/* Summary cards */}
        <EarningsSummary />

        {/* Period selector */}
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'flex-1 py-2 rounded-xl text-sm font-medium',
                'transition-all duration-200',
                period === p
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100'
              )}
            >
              {p === 'week' && t('filter.week', language as any)}
              {p === 'month' && 'Month'}
              {p === 'year' && 'Year'}
            </button>
          ))}
        </div>

        {/* Chart */}
        {earningsData.length > 0 ? (
          <EarningsChart data={earningsData} period={period} />
        ) : !isLoading ? (
          <Card variant="outlined" className="py-8 text-center">
            <DollarSign className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">No earnings data yet</p>
          </Card>
        ) : null}

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card variant="outlined" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total shifts</p>
              <p className="text-lg font-bold">{completedShifts}</p>
            </div>
          </Card>
          <Card variant="outlined" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total earned</p>
              <p className="text-lg font-bold">₪{totalEarned.toLocaleString()}</p>
            </div>
          </Card>
        </div>

        {/* Recent transactions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              Recent Transactions
            </h2>
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TransactionCard transaction={transaction} />
                </motion.div>
              ))}
            </div>
          ) : !isLoading ? (
            <Card variant="outlined" className="py-8 text-center">
              <Briefcase className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">No transactions yet</p>
            </Card>
          ) : null}
        </section>
      </main>

      <Navigation />
    </div>
  )
}

function TransactionCard({ transaction }: { transaction: Transaction }) {
  const isPayout = transaction.type === 'payout'

  return (
    <Card
      variant="default"
      interactive
      className="flex items-center gap-3"
    >
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center',
        isPayout ? 'bg-success/10' : 'bg-brand-primary/10'
      )}>
        {isPayout ? (
          <TrendingUp className="w-5 h-5 text-success" />
        ) : (
          <Briefcase className="w-5 h-5 text-brand-primary" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-neutral-900 truncate">
          {transaction.title}
        </p>
        <p className="text-sm text-neutral-500 truncate">
          {transaction.employer}
        </p>
      </div>

      <div className="text-right">
        <p className={cn(
          'font-bold',
          isPayout ? 'text-success' : 'text-neutral-900'
        )}>
          {isPayout ? '+' : ''}₪{transaction.amount}
        </p>
        <p className="text-xs text-neutral-400">
          {formatRelativeTime(transaction.date)}
        </p>
      </div>

      <ChevronRight className="w-4 h-4 text-neutral-400" />
    </Card>
  )
}

function formatRelativeTime(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()

  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString()
}
