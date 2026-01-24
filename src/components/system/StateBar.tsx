'use client'

import { motion, type Variants } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { StateVisualConfig } from '@/types/system-card'
import { cn } from '@/lib/utils'

interface StateBarProps {
  config: StateVisualConfig
  timeLeft?: number // seconds
  compact?: boolean
}

const pulseVariants: Variants = {
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 2.4,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
}

const stableVariants: Variants = {
  animate: {
    opacity: 1,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
}

const mutedVariants: Variants = {
  animate: {
    opacity: 0.4,
    transition: { duration: 1.2, ease: 'easeOut' },
  },
}

const fadeoutVariants: Variants = {
  animate: {
    opacity: [0.3, 0.15, 0.3],
    transition: {
      duration: 4,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
}

function getAnimationVariants(animation: StateVisualConfig['animation']): Variants {
  switch (animation) {
    case 'pulse': return pulseVariants
    case 'stable': return stableVariants
    case 'muted': return mutedVariants
    case 'fadeout': return fadeoutVariants
    default: return stableVariants
  }
}

export function StateBar({ config, timeLeft, compact }: StateBarProps) {
  const [countdown, setCountdown] = useState(timeLeft ?? 0)
  const isCountdown = config.animation === 'countdown' && timeLeft && timeLeft > 0

  useEffect(() => {
    if (!isCountdown) return
    setCountdown(timeLeft)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLeft, isCountdown])

  const progress = isCountdown && timeLeft > 0
    ? Math.max(0, countdown / timeLeft)
    : 1

  const variants = getAnimationVariants(config.animation)

  return (
    <div className={cn('relative w-full overflow-hidden', compact ? 'h-1' : 'h-1.5')}>
      {/* Background track */}
      <div className="absolute inset-0 bg-white/5 rounded-full" />

      {/* Animated bar */}
      <motion.div
        className={cn(
          'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r',
          config.color
        )}
        style={{
          boxShadow: `0 0 12px ${config.glowColor}`,
          width: isCountdown ? `${progress * 100}%` : '100%',
        }}
        variants={variants}
        animate="animate"
        initial={{ width: 0, opacity: 0 }}
        transition={
          isCountdown
            ? { width: { duration: 1, ease: 'linear' } }
            : undefined
        }
        layout
      />

      {/* Countdown shimmer overlay */}
      {isCountdown && (
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${progress * 100}%` }}
          animate={{
            background: [
              `linear-gradient(90deg, transparent 0%, ${config.glowColor} 50%, transparent 100%)`,
              `linear-gradient(90deg, transparent 100%, ${config.glowColor} 150%, transparent 200%)`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </div>
  )
}
