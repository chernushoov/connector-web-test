'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTrial } from '@/hooks'
import { Crown, Clock, Sparkles, AlertCircle } from 'lucide-react'

interface TrialBadgeProps {
  variant?: 'compact' | 'full'
  className?: string
  onClick?: () => void
}

export function TrialBadge({ variant = 'compact', className, onClick }: TrialBadgeProps) {
  const {
    badgeText,
    badgeColor,
    isTrialActive,
    isTrialEnding,
    isSubscribed,
    isTrialEnded,
    daysRemaining,
    hoursRemaining,
    openPricingModal,
  } = useTrial()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      openPricingModal()
    }
  }

  // Color schemes
  const colorSchemes = {
    gold: {
      bg: 'bg-gradient-to-r from-amber-400 to-yellow-500',
      text: 'text-amber-900',
      border: 'border-amber-300',
      glow: 'shadow-amber-400/30',
    },
    blue: {
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      text: 'text-white',
      border: 'border-blue-400',
      glow: 'shadow-blue-500/30',
    },
    red: {
      bg: 'bg-gradient-to-r from-red-500 to-orange-500',
      text: 'text-white',
      border: 'border-red-400',
      glow: 'shadow-red-500/30',
    },
    gray: {
      bg: 'bg-neutral-200',
      text: 'text-neutral-600',
      border: 'border-neutral-300',
      glow: '',
    },
  }

  const colors = colorSchemes[badgeColor as keyof typeof colorSchemes]

  // Icon based on status
  const Icon = isSubscribed ? Crown : isTrialEnding ? AlertCircle : isTrialActive ? Sparkles : Clock

  if (variant === 'compact') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
          'text-xs font-semibold',
          'transition-all duration-200',
          colors.bg,
          colors.text,
          isTrialEnding && 'animate-pulse',
          className
        )}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{badgeText}</span>
      </motion.button>
    )
  }

  // Full variant with more details
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={cn(
        'w-full p-4 rounded-2xl',
        'flex items-center justify-between',
        'transition-all duration-200',
        colors.bg,
        colors.text,
        colors.glow && `shadow-lg ${colors.glow}`,
        isTrialEnding && 'animate-pulse',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          isSubscribed ? 'bg-amber-300/30' : 'bg-white/20'
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className="font-semibold">
            {isSubscribed ? 'PRO Member' : isTrialActive ? 'Trial Active' : isTrialEnded ? 'Trial Ended' : 'Free Plan'}
          </p>
          <p className={cn('text-sm', isSubscribed ? 'text-amber-800' : 'opacity-80')}>
            {isSubscribed
              ? 'Unlimited access'
              : isTrialActive
                ? `${daysRemaining > 0 ? `${daysRemaining} days` : `${hoursRemaining} hours`} of PRO left`
                : isTrialEnded
                  ? 'Upgrade to continue'
                  : '2 applications/day'
            }
          </p>
        </div>
      </div>

      {!isSubscribed && (
        <div className={cn(
          'px-3 py-1.5 rounded-full text-sm font-medium',
          isTrialEnding || isTrialEnded
            ? 'bg-white text-red-600'
            : 'bg-white/20 text-white'
        )}>
          {isTrialEnding || isTrialEnded ? 'Upgrade' : 'View Plans'}
        </div>
      )}
    </motion.button>
  )
}

export default TrialBadge
