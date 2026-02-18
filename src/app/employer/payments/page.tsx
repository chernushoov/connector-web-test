'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { Header, Navigation, EmptyState, LoadingState } from '@/components/shared'
import { Button } from '@/components/ui/Button'
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  DollarSign,
  TrendingUp,
  User,
  ChevronRight,
} from 'lucide-react'
import type { Language } from '@/types'

interface EscrowPayment {
  id: string
  workerName: string
  shiftTitle: string
  shiftDate: string
  amount: number
  status: 'pending' | 'escrowed' | 'released' | 'disputed'
  createdAt: string
}

interface Transaction {
  id: string
  type: 'payment' | 'topup' | 'refund'
  description: string
  amount: number
  date: string
  status: 'completed' | 'pending' | 'failed'
}

type TabView = 'pending' | 'history'

export default function EmployerPaymentsPage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { showToast } = useConnectorStore()

  const [activeTab, setActiveTab] = useState<TabView>('pending')
  const [escrowPayments, setEscrowPayments] = useState<EscrowPayment[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [balance, setBalance] = useState({ total: 0, pending: 0, available: 0 })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load escrow data
      const res = await fetch('/api/payments/escrow')
      if (res.ok) {
        const data = await res.json()
        setEscrowPayments(data.escrows || [])
        setBalance(data.balance || { total: 0, pending: 0, available: 0 })
      }
    } catch {
      // empty
    } finally {
      setIsLoading(false)
    }
  }

  const handleRelease = async (escrowId: string) => {
    if (!confirm('Release payment to worker?')) return
    try {
      const res = await fetch(`/api/payments/escrow/${escrowId}/release`, {
        method: 'POST',
      })
      if (res.ok) {
        showToast('Payment released!', 'success')
        setEscrowPayments(prev =>
          prev.map(p => p.id === escrowId ? { ...p, status: 'released' as const } : p)
        )
      }
    } catch {
      showToast('Failed to release payment', 'error')
    }
  }

  const handleDispute = (escrowId: string) => {
    router.push(`/disputes?escrow_id=${escrowId}`)
  }

  const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
    escrowed: { label: 'In Escrow', color: 'bg-blue-100 text-blue-700', icon: Shield },
    released: { label: 'Released', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    disputed: { label: 'Disputed', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header title="Payments & Escrow" showBack showNotifications />

      {/* Balance card */}
      <div className="px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-brand-primary to-purple-700 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-white/80" />
            <span className="text-white/80 text-sm">Total Balance</span>
          </div>
          <p className="text-3xl font-bold mb-4">
            {balance.total.toLocaleString()} ILS
          </p>
          <div className="flex gap-6">
            <div>
              <p className="text-white/60 text-xs">Available</p>
              <p className="font-semibold">{balance.available.toLocaleString()} ILS</p>
            </div>
            <div>
              <p className="text-white/60 text-xs">In Escrow</p>
              <p className="font-semibold">{balance.pending.toLocaleString()} ILS</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2">
        <div className="flex bg-neutral-100 rounded-xl p-1">
          {(['pending', 'history'] as TabView[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500'
              )}
            >
              {tab === 'pending' ? 'Pending' : 'History'}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-4">
        {isLoading ? (
          <LoadingState variant="skeleton" />
        ) : activeTab === 'pending' ? (
          escrowPayments.filter(p => ['pending', 'escrowed'].includes(p.status)).length === 0 ? (
            <EmptyState
              type="no-results"
              title="No pending payments"
              subtitle="Payments for completed shifts will appear here"
              icon={<Shield className="w-16 h-16 text-neutral-300" />}
            />
          ) : (
            <motion.div className="space-y-3">
              {escrowPayments
                .filter(p => ['pending', 'escrowed'].includes(p.status))
                .map((payment, i) => {
                  const config = statusConfig[payment.status]
                  const StatusIcon = config.icon
                  return (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-2xl border border-neutral-200 p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-neutral-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-neutral-900">{payment.workerName}</h3>
                            <p className="text-sm text-neutral-500">{payment.shiftTitle}</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-neutral-900">{payment.amount} ILS</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', config.color)}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="primary" onClick={() => handleRelease(payment.id)}>
                            Release
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDispute(payment.id)}>
                            Dispute
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
            </motion.div>
          )
        ) : (
          transactions.length === 0 ? (
            <EmptyState
              type="no-results"
              title="No transactions yet"
              subtitle="Your payment history will appear here"
              icon={<CreditCard className="w-16 h-16 text-neutral-300" />}
            />
          ) : (
            <motion.div className="space-y-2">
              {transactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-xl p-4 flex items-center gap-3"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    tx.type === 'payment' ? 'bg-red-100' : tx.type === 'topup' ? 'bg-green-100' : 'bg-amber-100'
                  )}>
                    {tx.type === 'payment'
                      ? <ArrowUpRight className="w-5 h-5 text-red-600" />
                      : tx.type === 'topup'
                        ? <ArrowDownRight className="w-5 h-5 text-green-600" />
                        : <ArrowDownRight className="w-5 h-5 text-amber-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{tx.description}</p>
                    <p className="text-xs text-neutral-500">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <span className={cn(
                    'font-semibold',
                    tx.type === 'payment' ? 'text-red-600' : 'text-green-600'
                  )}>
                    {tx.type === 'payment' ? '-' : '+'}{tx.amount} ILS
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )
        )}
      </main>

      <Navigation />
    </div>
  )
}
