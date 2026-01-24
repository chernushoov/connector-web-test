'use client'

import { motion } from 'framer-motion'
import type { EmployerCardProps } from '@/types/system-card'
import { EMPLOYER_STATE_CONFIG } from '@/types/system-card'
import { SystemCard } from './SystemCard'
import { EmployerTrustSnapshot } from './TrustSnapshot'
import { cn } from '@/lib/utils'

// ────────────────────────────────────
// EMPLOYER CARD
// ────────────────────────────────────

export function EmployerCard({
  id,
  sector,
  company,
  location,
  state,
  stateMeta,
  trust,
  systemNote,
  allowedAction,
  context = 'profile',
  onAction,
}: EmployerCardProps) {
  const stateConfig = EMPLOYER_STATE_CONFIG[state]
  const isCompact = context === 'map'

  return (
    <SystemCard
      stateConfig={stateConfig}
      timeLeft={stateMeta?.timeLeft}
      context={context}
      systemNote={systemNote}
      allowedAction={allowedAction}
      onAction={onAction}
    >
      {/* Identity Block */}
      <div className={cn('mb-3', isCompact && 'mb-2')}>
        <motion.div
          className="flex items-baseline gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="text-[11px] font-mono text-white/30 tracking-wider">
            {id}
          </span>
          {isCompact && location && (
            <span className="text-[9px] text-white/20 font-mono">
              {location}
            </span>
          )}
        </motion.div>

        {/* Sector */}
        <motion.h3
          className={cn(
            'font-medium text-white/90 tracking-tight',
            isCompact ? 'text-sm mt-0.5' : 'text-base mt-1'
          )}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {sector}
        </motion.h3>

        {/* Company (profile only) */}
        {!isCompact && company && (
          <motion.span
            className="text-[11px] text-white/35 mt-0.5 block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.18 }}
          >
            {company}
          </motion.span>
        )}

        {!isCompact && location && (
          <motion.span
            className="text-[11px] text-white/25 font-mono mt-0.5 block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {location}
          </motion.span>
        )}
      </div>

      {/* Trust Snapshot */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25 }}
      >
        <EmployerTrustSnapshot
          paymentReliability={trust.paymentReliability}
          disputeRatio={trust.disputeRatio}
          responseTime={trust.responseTime}
          penaltyActive={trust.penaltyActive}
          compact={isCompact}
        />
      </motion.div>

      {/* Active Workers count (profile only) */}
      {!isCompact && stateMeta?.activeWorkers !== undefined && stateMeta.activeWorkers > 0 && (
        <motion.div
          className="mt-3 flex items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
            {stateMeta.activeWorkers} active worker{stateMeta.activeWorkers > 1 ? 's' : ''}
          </span>
        </motion.div>
      )}

      {/* Escrow Status */}
      {!isCompact && stateMeta?.escrowStatus && stateMeta.escrowStatus !== 'NONE' && (
        <motion.div
          className="mt-2 flex items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.32 }}
        >
          <div className={cn(
            'w-1.5 h-1.5 rounded-full',
            stateMeta.escrowStatus === 'FUNDED' && 'bg-emerald-400/80',
            stateMeta.escrowStatus === 'HOLD' && 'bg-amber-400/80'
          )} />
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
            Escrow {stateMeta.escrowStatus.toLowerCase()}
          </span>
        </motion.div>
      )}

      {/* Timer */}
      {!isCompact && stateMeta?.timeLeft && stateMeta.timeLeft > 0 && (
        <motion.div
          className="mt-2 flex items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <span className="text-[10px] font-mono text-white/25 uppercase tracking-wider">
            Expires
          </span>
          <span className="text-xs font-mono tabular-nums text-white/50">
            {formatTime(stateMeta.timeLeft)}
          </span>
        </motion.div>
      )}
    </SystemCard>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}
