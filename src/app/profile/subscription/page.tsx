'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore } from '@/store'
import { useTrial } from '@/hooks'
import { t } from '@/i18n/translations'
import { Header, Navigation, LoadingState } from '@/components/shared'
import { TrialBadge } from '@/components/subscription'
import { Button } from '@/components/ui/Button'
import {
  CheckCircle2,
  Crown,
  CreditCard,
  Calendar,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  XCircle,
} from 'lucide-react'
import type { Language } from '@/types'

interface SubscriptionData {
  id: string
  plan: string
  is_active: boolean
  current_period_start: string
  current_period_end: string
  canceled_at: string | null
  stripe_subscription_id: string | null
}

export default function SubscriptionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language, isRTL } = useUI()
  const { showToast } = useConnectorStore()
  const { isTrialActive, trialStats, subscription: trialSub } = useTrial()

  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Handle Stripe checkout return
  const success = searchParams.get('success')
  const cancelled = searchParams.get('cancelled')
  const demo = searchParams.get('demo')

  useEffect(() => {
    if (success === 'true') {
      showToast(demo ? 'Subscription activated (demo)' : 'Subscription activated!', 'success')
    }
    if (cancelled === 'true') {
      showToast('Checkout cancelled', 'info')
    }
    loadSubscription()
  }, [])

  const loadSubscription = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/subscriptions')
      if (res.ok) {
        const data = await res.json()
        setSubscription(data.subscription)
      }
    } catch {
      // no subscription
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setIsCancelling(true)
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'User requested cancellation' }),
      })
      if (res.ok) {
        showToast('Subscription will be cancelled at end of billing period', 'success')
        setShowCancelConfirm(false)
        loadSubscription()
      } else {
        showToast('Failed to cancel subscription', 'error')
      }
    } catch {
      showToast('Failed to cancel subscription', 'error')
    } finally {
      setIsCancelling(false)
    }
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'he' ? 'he-IL' : 'ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header title="Subscription" showBack />

      <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {isLoading ? (
          <LoadingState variant="skeleton" />
        ) : (
          <>
            {/* Trial badge */}
            {isTrialActive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <TrialBadge variant="full" />
              </motion.div>
            )}

            {/* Active subscription */}
            {subscription?.is_active ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
              >
                {/* Plan header */}
                <div className="bg-gradient-to-r from-purple-600 to-brand-primary p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Crown className="w-6 h-6" />
                    <h2 className="text-xl font-bold uppercase">{subscription.plan} Plan</h2>
                  </div>
                  <p className="text-white/80 text-sm">Your subscription is active</p>
                </div>

                <div className="p-6 space-y-4">
                  {/* Billing info */}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-600">Current period</p>
                      <p className="font-medium text-neutral-900">
                        {formatDate(subscription.current_period_start)} — {formatDate(subscription.current_period_end)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-600">Payment method</p>
                      <p className="font-medium text-neutral-900">Card ending in ****</p>
                    </div>
                  </div>

                  {subscription.canceled_at && (
                    <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">Cancellation pending</p>
                        <p className="text-xs text-amber-700">
                          Active until {formatDate(subscription.current_period_end)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-neutral-100 space-y-3">
                    {subscription.plan !== 'business' && (
                      <Button
                        variant="primary"
                        className="w-full"
                        leftIcon={<Sparkles className="w-4 h-4" />}
                        onClick={handleUpgrade}
                      >
                        Upgrade Plan
                      </Button>
                    )}
                    {!subscription.canceled_at && (
                      <Button
                        variant="ghost"
                        className="w-full text-red-600 hover:bg-red-50"
                        onClick={() => setShowCancelConfirm(true)}
                      >
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              /* No active subscription */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-neutral-200 p-6 text-center"
              >
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-neutral-400" />
                </div>
                <h2 className="text-lg font-bold text-neutral-900 mb-2">No Active Subscription</h2>
                <p className="text-neutral-600 mb-6">
                  Upgrade to PRO for unlimited applications, priority placement, and more.
                </p>
                <Button
                  variant="primary"
                  className="w-full"
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  onClick={handleUpgrade}
                >
                  View Plans
                </Button>
              </motion.div>
            )}

            {/* Features list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-neutral-200 p-6"
            >
              <h3 className="font-bold text-neutral-900 mb-4">PRO Benefits</h3>
              <div className="space-y-3">
                {[
                  'Unlimited shift applications',
                  'Priority in search results',
                  'Full analytics dashboard',
                  'PRO badge on profile',
                  'Early access to shifts',
                  'Smart match notifications',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-neutral-700">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </main>

      {/* Cancel confirmation modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
          >
            <div className="text-center mb-6">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-neutral-900">Cancel Subscription?</h3>
              <p className="text-sm text-neutral-600 mt-2">
                Your PRO benefits will continue until the end of the current billing period.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setShowCancelConfirm(false)}
              >
                Keep Subscription
              </Button>
              <Button
                variant="ghost"
                className="w-full text-red-600"
                onClick={handleCancelSubscription}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <Navigation />
    </div>
  )
}
