'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'
import type { StateVisualConfig, CardContext } from '@/types/system-card'
import { StateBar } from './StateBar'
import { cn } from '@/lib/utils'

// ────────────────────────────────────
// SYSTEM CARD BASE
// ────────────────────────────────────

interface SystemCardProps {
  stateConfig: StateVisualConfig
  timeLeft?: number
  context?: CardContext
  systemNote?: string
  allowedAction?: { label: string; event: string }
  onAction?: (event: string) => void
  children: ReactNode
  className?: string
}

export function SystemCard({
  stateConfig,
  timeLeft,
  context = 'profile',
  systemNote,
  allowedAction,
  onAction,
  children,
  className,
}: SystemCardProps) {
  const isCompact = context === 'map'

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden',
        'bg-neutral-900/80 backdrop-blur-xl',
        'border border-white/[0.06]',
        isCompact ? 'rounded-xl p-3' : 'rounded-2xl p-5',
        'transition-shadow duration-700',
        className
      )}
      style={{
        boxShadow: `0 0 24px -8px ${stateConfig.glowColor}, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      whileHover={isCompact ? { y: -2, transition: { duration: 0.3 } } : undefined}
      layout
    >
      {/* State Bar */}
      <StateBar
        config={stateConfig}
        timeLeft={timeLeft}
        compact={isCompact}
      />

      {/* Content */}
      <div className={cn('mt-3', isCompact && 'mt-2')}>
        {children}
      </div>

      {/* System Note */}
      <AnimatePresence mode="wait">
        {systemNote && (
          <motion.div
            key={systemNote}
            className={cn(
              'mt-3 pt-3 border-t border-white/[0.06]',
              isCompact && 'mt-2 pt-2'
            )}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <p className="text-[11px] text-white/35 font-mono leading-relaxed tracking-wide">
              {systemNote}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Allowed Action */}
      <AnimatePresence>
        {allowedAction && (
          <motion.div
            className={cn('mt-3', isCompact && 'mt-2')}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <button
              onClick={() => onAction?.(allowedAction.event)}
              className={cn(
                'w-full py-2 px-3 rounded-lg',
                'bg-white/[0.06] hover:bg-white/[0.10]',
                'border border-white/[0.08]',
                'text-[11px] text-white/60 hover:text-white/80',
                'font-mono tracking-wider uppercase',
                'transition-all duration-300',
                'active:scale-[0.98]'
              )}
            >
              {allowedAction.label}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* State label (profile only) */}
      {!isCompact && (
        <div className="absolute top-5 right-5">
          <motion.span
            className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/25"
            key={stateConfig.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {stateConfig.label}
          </motion.span>
        </div>
      )}
    </motion.div>
  )
}
