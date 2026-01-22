'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useWorker } from '@/store'
import { t } from '@/i18n/translations'
import { Header, Navigation } from '@/components/shared'
import { EarningsChart, EarningsSummary } from '@/components/worker'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Download,
  Clock,
  Briefcase,
  ChevronRight
} from 'lucide-react'

type Period = 'week' | 'month' | 'year'

// Mock data
const weeklyData = [
  { date: '2024-01-15', amount: 320, shifts: 1 },
  { date: '2024-01-16', amount: 450, shifts: 2 },
  { date: '2024-01-17', amount: 0, shifts: 0 },
  { date: '2024-01-18', amount: 560, shifts: 2 },
  { date: '2024-01-19', amount: 380, shifts: 1 },
  { date: '2024-01-20', amount: 0, shifts: 0 },
  { date: '2024-01-21', amount: 740, shifts: 3 },
]

const recentTransactions = [
  {
    id: '1',
    type: 'earning',
    title: 'Warehouse Helper',
    employer: 'FastLogistics Ltd',
    amount: 440,
    date: new Date(Date.now() - 3600000),
    status: 'completed',
  },
  {
    id: '2',
    type: 'earning',
    title: 'Event Setup',
    employer: 'Marina Events Co',
    amount: 560,
    date: new Date(Date.now() - 86400000),
    status: 'paid',
  },
  {
    id: '3',
    type: 'payout',
    title: 'Weekly Payout',
    employer: 'Connector',
    amount: 1850,
    date: new Date(Date.now() - 172800000),
    status: 'paid',
  },
  {
    id: '4',
    type: 'earning',
    title: 'Moving Assistant',
    employer: 'QuickMove',
    amount: 480,
    date: new Date(Date.now() - 259200000),
    status: 'paid',
  },
]

export default function EarningsPage() {
  const { language, isRTL } = useUI()
  const { totalEarned, completedShifts } = useWorker()

  const [period, setPeriod] = useState<Period>('week')

  return (
    <div
      className="min-h-screen bg-neutral-50 pb-20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Header
        title={t('profile.earned', language as any)}
        showBack
        rightContent={
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {}}
          >
            <Download className="w-5 h-5" />
          </Button>
        }
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
        <EarningsChart data={weeklyData} period={period} />

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card variant="outlined" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total hours</p>
              <p className="text-lg font-bold">156h</p>
            </div>
          </Card>
          <Card variant="outlined" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Avg rate</p>
              <p className="text-lg font-bold">₪58/hr</p>
            </div>
          </Card>
        </div>

        {/* Recent transactions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              Recent Transactions
            </h2>
            <Button variant="ghost" size="sm">
              See all
            </Button>
          </div>

          <div className="space-y-3">
            {recentTransactions.map((transaction, index) => (
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
        </section>

        {/* Payout info */}
        <Card variant="accent" className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-neutral-900">Next payout</p>
            <p className="text-sm text-neutral-600">Tuesday, Jan 23</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-brand-primary">₪650</p>
            <p className="text-xs text-neutral-500">Pending</p>
          </div>
        </Card>
      </main>

      <Navigation />
    </div>
  )
}

function TransactionCard({
  transaction
}: {
  transaction: {
    id: string
    type: string
    title: string
    employer: string
    amount: number
    date: Date
    status: string
  }
}) {
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
