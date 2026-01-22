'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Check, PartyPopper, Star, Sparkles, Trophy, Heart, DollarSign } from 'lucide-react'

type CelebrationType = 'simple' | 'confetti' | 'stars' | 'money' | 'trophy'

interface SuccessAnimationProps {
  isVisible: boolean
  type?: CelebrationType
  title?: string
  subtitle?: string
  value?: string | number
  duration?: number
  onComplete?: () => void
  className?: string
}

// Confetti particle component
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  return (
    <motion.div
      initial={{
        opacity: 1,
        scale: 0,
        x: 0,
        y: 0,
        rotate: 0,
      }}
      animate={{
        opacity: [1, 1, 0],
        scale: [0, 1, 0.5],
        x: (Math.random() - 0.5) * 200,
        y: [0, -100, 200],
        rotate: Math.random() * 720,
      }}
      transition={{
        duration: 2,
        delay,
        ease: 'easeOut',
      }}
      className={cn('absolute w-3 h-3 rounded-sm', color)}
    />
  )
}

// Star particle component
function StarParticle({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
        y: -100,
        x: (Math.random() - 0.5) * 100,
      }}
      transition={{ duration: 1.5, delay }}
      className="absolute"
    >
      <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
    </motion.div>
  )
}

// Money particle component
function MoneyParticle({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0.5],
        y: 100,
        x: (Math.random() - 0.5) * 150,
        rotate: (Math.random() - 0.5) * 90,
      }}
      transition={{ duration: 2, delay }}
      className="absolute bg-green-500 text-white rounded-full p-1"
    >
      <DollarSign className="w-4 h-4" />
    </motion.div>
  )
}

const confettiColors = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-cyan-500',
]

export function SuccessAnimation({
  isVisible,
  type = 'simple',
  title = 'Success!',
  subtitle,
  value,
  duration = 3000,
  onComplete,
  className,
}: SuccessAnimationProps) {
  const [particles, setParticles] = useState<number[]>([])

  useEffect(() => {
    if (isVisible && (type === 'confetti' || type === 'stars' || type === 'money')) {
      setParticles(Array.from({ length: type === 'confetti' ? 30 : 12 }, (_, i) => i))
    }
  }, [isVisible, type])

  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onComplete])

  const getIcon = () => {
    switch (type) {
      case 'confetti':
        return <PartyPopper className="w-8 h-8 text-white" />
      case 'stars':
        return <Sparkles className="w-8 h-8 text-white" />
      case 'trophy':
        return <Trophy className="w-8 h-8 text-white" />
      case 'money':
        return <DollarSign className="w-8 h-8 text-white" />
      default:
        return <Check className="w-8 h-8 text-white" />
    }
  }

  const getGradient = () => {
    switch (type) {
      case 'confetti':
        return 'from-purple-500 to-pink-500'
      case 'stars':
        return 'from-yellow-400 to-orange-500'
      case 'trophy':
        return 'from-amber-400 to-yellow-500'
      case 'money':
        return 'from-green-500 to-emerald-600'
      default:
        return 'from-green-500 to-green-600'
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center',
            'bg-black/40 backdrop-blur-sm',
            className
          )}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative flex flex-col items-center"
          >
            {/* Particles */}
            {type === 'confetti' && particles.map((i) => (
              <ConfettiParticle
                key={i}
                delay={i * 0.03}
                color={confettiColors[i % confettiColors.length]}
              />
            ))}

            {type === 'stars' && particles.map((i) => (
              <StarParticle key={i} delay={i * 0.1} />
            ))}

            {type === 'money' && particles.map((i) => (
              <MoneyParticle key={i} delay={i * 0.1} />
            ))}

            {/* Main icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className={cn(
                'w-20 h-20 rounded-full flex items-center justify-center',
                'bg-gradient-to-br shadow-2xl',
                getGradient()
              )}
            >
              {getIcon()}
            </motion.div>

            {/* Value (for money celebrations) */}
            {value && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 text-4xl font-bold text-white drop-shadow-lg"
              >
                {typeof value === 'number' ? `₪${value.toLocaleString()}` : value}
              </motion.div>
            )}

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-2xl font-bold text-white drop-shadow-lg"
            >
              {title}
            </motion.h2>

            {/* Subtitle */}
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-2 text-white/80 text-center max-w-xs"
              >
                {subtitle}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Hook for triggering success animations
 */
export function useSuccessAnimation() {
  const [animation, setAnimation] = useState<{
    isVisible: boolean
    type: CelebrationType
    title: string
    subtitle?: string
    value?: string | number
  }>({
    isVisible: false,
    type: 'simple',
    title: 'Success!',
  })

  const show = (options: {
    type?: CelebrationType
    title?: string
    subtitle?: string
    value?: string | number
    duration?: number
  } = {}) => {
    setAnimation({
      isVisible: true,
      type: options.type || 'simple',
      title: options.title || 'Success!',
      subtitle: options.subtitle,
      value: options.value,
    })

    setTimeout(() => {
      setAnimation(prev => ({ ...prev, isVisible: false }))
    }, options.duration || 3000)
  }

  const celebrate = {
    simple: (title?: string, subtitle?: string) =>
      show({ type: 'simple', title, subtitle }),

    confetti: (title?: string, subtitle?: string) =>
      show({ type: 'confetti', title: title || 'Congratulations!', subtitle }),

    stars: (title?: string, subtitle?: string) =>
      show({ type: 'stars', title: title || 'Amazing!', subtitle }),

    money: (amount: number, subtitle?: string) =>
      show({
        type: 'money',
        title: 'Earned!',
        value: amount,
        subtitle: subtitle || 'Great work!',
      }),

    trophy: (title?: string, subtitle?: string) =>
      show({ type: 'trophy', title: title || 'Achievement Unlocked!', subtitle }),
  }

  const Animation = () => (
    <SuccessAnimation
      isVisible={animation.isVisible}
      type={animation.type}
      title={animation.title}
      subtitle={animation.subtitle}
      value={animation.value}
      onComplete={() => setAnimation(prev => ({ ...prev, isVisible: false }))}
    />
  )

  return { show, celebrate, Animation, isVisible: animation.isVisible }
}

export default SuccessAnimation
