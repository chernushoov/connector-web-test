'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTrial } from '@/hooks'
import { useUI, useConnectorStore } from '@/store'
import { Header } from '@/components/shared'
import { PlanCard, TrialBadge } from '@/components/subscription'
import { Button } from '@/components/ui/Button'
import {
  Shield,
  CreditCard,
  CheckCircle2,
  HelpCircle,
  MessageCircle,
  ChevronDown,
} from 'lucide-react'
import type { PricingPlan, SubscriptionPlan } from '@/types'

// Pricing plans data
const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'month',
    features: [
      'Basic profile',
      'View all shifts',
      'Apply to shifts',
      'Basic messaging',
    ],
    limitations: [
      '2 applications per day',
      'Standard search position',
      'No analytics',
    ],
  },
  {
    id: 'pro',
    name: 'PRO',
    price: 49,
    period: 'month',
    features: [
      'Unlimited applications',
      'Priority in search results',
      'Full analytics dashboard',
      'Direct messaging',
      'PRO badge on profile',
      'Early access to shifts',
      'Smart match notifications',
    ],
    isPopular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 149,
    period: 'month',
    features: [
      'Everything in PRO',
      'Unlimited shift postings',
      'Team management',
      'Priority support',
      'Custom branding',
      'API access',
      'Dedicated account manager',
    ],
    savings: 298,
  },
]

// FAQ data
const faqs = [
  {
    question: 'How does the 3-day trial work?',
    answer: 'Your trial starts automatically when you sign up. During the trial, you have full PRO access. After 3 days, you can choose to continue with PRO or switch to the free plan.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes! You can cancel your subscription at any time. Your PRO benefits will continue until the end of your billing period.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and local Israeli payment methods.',
  },
  {
    question: 'Is my payment information secure?',
    answer: 'Yes. We use Stripe for payment processing, which is PCI-DSS Level 1 certified – the highest level of security certification available.',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { showToast } = useConnectorStore()
  const {
    subscribe,
    isSubscribed,
    subscription,
    trialStats,
    isTrialActive,
    closeTrialEndModal,
  } = useTrial()

  const [isLoading, setIsLoading] = useState<SubscriptionPlan | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan === subscription.currentPlan) return

    if (plan === 'free') {
      // Just close any modals and go back
      closeTrialEndModal()
      router.back()
      return
    }

    setIsLoading(plan)

    try {
      await subscribe(plan)
      showToast(`Welcome to ${plan.toUpperCase()}!`, 'success')
      router.push('/')
    } catch (error) {
      showToast('Payment failed. Please try again.', 'error')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div
      className="min-h-screen bg-neutral-50"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <Header
        showBack
        onBack={() => router.back()}
        title="Choose Your Plan"
      />

      <main className="px-4 py-6 pb-24 max-w-4xl mx-auto">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-neutral-900 mb-3">
            Find More Work, Earn More
          </h1>
          <p className="text-neutral-600 max-w-md mx-auto">
            Upgrade to PRO and unlock unlimited applications, priority placement, and powerful analytics.
          </p>
        </motion.div>

        {/* Current status card */}
        {(isTrialActive || isSubscribed) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <TrialBadge variant="full" />
          </motion.div>
        )}

        {/* Trial stats if ending */}
        {isTrialActive && trialStats.earnings > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 mb-8"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">
                  You earned ₪{trialStats.earnings.toLocaleString()} during your trial!
                </p>
                <p className="text-sm text-green-700">
                  Keep the momentum going with PRO
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Plans grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6 md:grid-cols-3 mb-12"
        >
          {pricingPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={subscription.currentPlan === plan.id}
              onSelect={handleSelectPlan}
              isLoading={isLoading === plan.id}
            />
          ))}
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-6 mb-12 py-6 border-y border-neutral-200"
        >
          <div className="flex items-center gap-2 text-neutral-600">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm">Secure payment</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="text-sm">Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
            <span className="text-sm">Instant activation</span>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-xl font-bold text-neutral-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-medium text-neutral-900">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 text-neutral-400 transition-transform',
                      expandedFaq === index && 'rotate-180'
                    )}
                  />
                </button>
                {expandedFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4"
                  >
                    <p className="text-neutral-600 text-sm">{faq.answer}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Help section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-neutral-600 mb-4">
            Have questions? We're here to help.
          </p>
          <Button
            variant="outline"
            leftIcon={<MessageCircle className="w-4 h-4" />}
            onClick={() => {
              showToast('Support chat coming soon!', 'info')
            }}
          >
            Contact Support
          </Button>
        </motion.div>
      </main>
    </div>
  )
}
