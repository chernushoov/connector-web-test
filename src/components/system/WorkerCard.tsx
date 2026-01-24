'use client'

import { motion } from 'framer-motion'
import type { WorkerCardProps } from '@/types/system-card'
import { WORKER_STATE_CONFIG } from '@/types/system-card'
import { SystemCard } from './SystemCard'
import { WorkerTrustSnapshot } from './TrustSnapshot'
import { cn } from '@/lib/utils'

// ────────────────────────────────────
// WORKER CARD
// ────────────────────────────────────

export function WorkerCard({
  id,
  role,
  location,
  state,
  stateMeta,
  trust,
  systemNote,
  allowedAction,
  context = 'profile',
  onAction,
}: WorkerCardProps) {
  const stateConfig = WORKER_STATE_CONFIG[state]
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
        <motion.h3
          className={cn(
            'font-medium text-white/90 tracking-tight',
            isCompact ? 'text-sm mt-0.5' : 'text-base mt-1'
          )}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {role}
        </motion.h3>
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
        <WorkerTrustSnapshot
          reliability={trust.reliability}
          latency={trust.latency}
          silenceRatio={trust.silenceRatio}
          penaltyActive={trust.penaltyActive}
          compact={isCompact}
        />
      </motion.div>

      {/* Escrow Status (profile only) */}
      {!isCompact && stateMeta?.escrowStatus && stateMeta.escrowStatus !== 'NONE' && (
        <motion.div
          className="mt-3 flex items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
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

      {/* Timer (profile, when reserved) */}
      {!isCompact && stateMeta?.timeLeft && stateMeta.timeLeft > 0 && (
        <motion.div
          className="mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <CountdownDisplay seconds={stateMeta.timeLeft} />
        </motion.div>
      )}
    </SystemCard>
  )
}

// ────────────────────────────────────
// COUNTDOWN DISPLAY
// ────────────────────────────────────

function CountdownDisplay({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-mono text-white/25 uppercase tracking-wider">
        Expires
      </span>
      <span className="text-xs font-mono tabular-nums text-white/50">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
    </div>
  )
}
