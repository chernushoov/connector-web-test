'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTrial } from '@/hooks'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import {
  X,
  Crown,
  Check,
  TrendingUp,
  Briefcase,
  Star,
  Eye,
  Zap,
  Shield,
} from 'lucide-react'

interface TrialEndModalProps {
  className?: string
}

export function TrialEndModal({ className }: TrialEndModalProps) {
  const router = useRouter()
  const {
    showTrialEndModal,
    closeTrialEndModal,
    trialStats,
    subscribe,
    isTrialEnding,
  } = useTrial()

  const handleUpgrade = async () => {
    router.push('/pricing')
    closeTrialEndModal()
  }

  const handleStayFree = () => {
    closeTrialEndModal()
  }

  if (!showTrialEndModal) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={closeTrialEndModal}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'w-full max-w-md bg-white rounded-3xl overflow-hidden',
            'shadow-2xl',
            className
          )}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">
            <button
              onClick={closeTrialEndModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                {isTrialEnding ? (
                  <Zap className="w-6 h-6" />
                ) : (
                  <Crown className="w-6 h-6" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {isTrialEnding ? 'Trial Ending Soon!' : 'Your Trial Has Ended'}
                </h2>
                <p className="text-sm text-white/80">
                  {isTrialEnding
                    ? 'Upgrade now to keep full access'
                    : 'Here\'s what you achieved'}
                </p>
              </div>
            </div>

            {/* Stats during trial */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-300" />
                  <span className="text-xs text-white/70">Earned</span>
                </div>
                <p className="text-lg font-bold">
                  {trialStats.earnings > 0 ? `₪${trialStats.earnings.toLocaleString()}` : '—'}
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="w-4 h-4 text-blue-300" />
                  <span className="text-xs text-white/70">Shifts</span>
                </div>
                <p className="text-lg font-bold">{trialStats.shiftsCompleted}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs text-white/70">Approved</span>
                </div>
                <p className="text-lg font-bold">{trialStats.applicationsApproved}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-purple-300" />
                  <span className="text-xs text-white/70">Profile views</span>
                </div>
                <p className="text-lg font-bold">{trialStats.profileViews}</p>
              </div>
            </div>
          </div>

          {/* Plans comparison */}
          <div className="p-6 space-y-4">
            {/* PRO Plan */}
            <div className="relative border-2 border-blue-500 rounded-2xl p-4 bg-blue-50/50">
              <div className="absolute -top-3 left-4 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                RECOMMENDED
              </div>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-neutral-900">PRO</h3>
                  <p className="text-sm text-neutral-600">Full access</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">₪49</p>
                  <p className="text-xs text-neutral-500">/month</p>
                </div>
              </div>

              <ul className="space-y-2 mb-4">
                {[
                  'Unlimited applications',
                  'Priority in search',
                  'Full analytics',
                  'Direct messaging',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleUpgrade}
                leftIcon={<Crown className="w-4 h-4" />}
              >
                Upgrade to PRO
              </Button>
            </div>

            {/* Free Plan */}
            <div className="border border-neutral-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-neutral-900">Free</h3>
                  <p className="text-sm text-neutral-500">Limited access</p>
                </div>
                <p className="text-lg font-semibold text-neutral-600">₪0</p>
              </div>

              <ul className="space-y-2 mb-4 text-sm text-neutral-600">
                <li className="flex items-center gap-2">
                  <span className="text-neutral-400">•</span>
                  2 applications per day
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-neutral-400">•</span>
                  Basic profile
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-neutral-400">•</span>
                  Standard search position
                </li>
              </ul>

              <Button
                variant="ghost"
                size="lg"
                className="w-full"
                onClick={handleStayFree}
              >
                Stay on Free
              </Button>
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 text-xs text-neutral-500 justify-center">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure payment • Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TrialEndModal
