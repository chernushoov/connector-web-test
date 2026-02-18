'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import {
  Shield,
  User,
  CalendarDays,
  AlertCircle,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react'

interface EscrowTransaction {
  id: string
  workerName: string
  shiftTitle: string
  amount: number
  platformFee: number
  status: string
  createdAt: string
  releasedAt?: string
}

interface EscrowData {
  balance: number
  transactions: EscrowTransaction[]
}

const txStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending': return { bg: 'bg-blue-100', text: 'text-blue-700' }
    case 'escrowed': return { bg: 'bg-amber-100', text: 'text-amber-700' }
    case 'released': return { bg: 'bg-emerald-100', text: 'text-emerald-700' }
    case 'disputed': return { bg: 'bg-red-100', text: 'text-red-600' }
    case 'processing': return { bg: 'bg-indigo-100', text: 'text-indigo-700' }
    case 'failed': return { bg: 'bg-red-100', text: 'text-red-600' }
    default: return { bg: 'bg-neutral-100', text: 'text-neutral-500' }
  }
}

function TransactionSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-neutral-200" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-neutral-200 rounded mb-2" />
          <div className="h-3 w-24 bg-neutral-200 rounded" />
        </div>
        <div className="h-5 w-16 bg-neutral-200 rounded" />
      </div>
    </div>
  )
}

export default function EmployerEscrowPage() {
  const { language, isRTL } = useUI()
  const [data, setData] = useState<EscrowData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEscrow = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/escrow')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setData({ balance: json.balance || 0, transactions: json.transactions || [] })
    } catch {
      setError('Failed to load escrow data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEscrow() }, [fetchEscrow])

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t('tabs.escrow', language)}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Secure payment management</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-brand-primary" />
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </motion.div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-6 mb-6 animate-pulse">
          <div className="h-4 w-20 bg-neutral-200 rounded mb-3" />
          <div className="h-10 w-32 bg-neutral-200 rounded" />
        </div>
      ) : data ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className={cn('rounded-2xl p-6 mb-6 shadow-lg', 'bg-gradient-to-br from-brand-primary to-brand-primary/80')}>
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-white/70" />
            <p className="text-sm text-white/70 font-medium">Escrow Balance</p>
          </div>
          <p className="text-4xl font-bold text-white">{'\u20AA'}{data.balance.toLocaleString()}</p>
          <p className="text-xs text-white/50 mt-2">Funds held securely until release</p>
        </motion.div>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold text-neutral-900 mb-3">Transaction History</h2>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <TransactionSkeleton key={i} />)}
          </div>
        )}

        {!loading && data && data.transactions.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-700 mb-1">No transactions yet</h3>
            <p className="text-sm text-neutral-500">Escrow transactions will appear here when you hire workers</p>
          </div>
        )}

        {!loading && data && data.transactions.length > 0 && (
          <div className="space-y-3">
            {data.transactions.map((tx, idx) => {
              const style = txStatusStyle(tx.status)
              const isOutgoing = tx.status.toLowerCase() === 'released'
              return (
                <motion.div key={tx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      isOutgoing ? 'bg-emerald-50' : 'bg-amber-50')}>
                      {isOutgoing ? <ArrowUpRight className="w-5 h-5 text-emerald-600" /> : <ArrowDownRight className="w-5 h-5 text-amber-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-neutral-900 truncate">{tx.shiftTitle}</p>
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                            <User className="w-3 h-3" />{tx.workerName}
                          </div>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <p className="font-bold text-neutral-900">{'\u20AA'}{tx.amount.toLocaleString()}</p>
                          {tx.platformFee > 0 && <p className="text-[10px] text-neutral-400">Fee: {'\u20AA'}{tx.platformFee}</p>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', style.bg, style.text)}>{tx.status}</span>
                        <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />{tx.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
