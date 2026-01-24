'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

// ────────────────────────────────────
// METRIC RING — Circular trust indicator
// ────────────────────────────────────

interface MetricRingProps {
  value: number       // 0–100
  label: string       // e.g. "Reliability"
  size?: number       // px, default 44
  strokeWidth?: number
  penaltyActive?: boolean
}

function MetricRing({
  value,
  label,
  size = 44,
  strokeWidth = 3,
  penaltyActive,
}: MetricRingProps) {
  const motionValue = useMotionValue(0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const strokeDashoffset = useTransform(
    motionValue,
    [0, 100],
    [circumference, 0]
  )

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1,
      ease: 'easeOut',
    })
    return controls.stop
  }, [value, motionValue])

  const getColor = (v: number) => {
    if (penaltyActive) return 'rgba(248, 113, 113, 0.8)' // red-400
    if (v >= 80) return 'rgba(52, 211, 153, 0.9)'        // emerald-400
    if (v >= 60) return 'rgba(251, 191, 36, 0.8)'        // amber-400
    if (v >= 40) return 'rgba(251, 146, 60, 0.8)'        // orange-400
    return 'rgba(248, 113, 113, 0.8)'                     // red-400
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Value arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor(value)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedNumber value={value} penaltyActive={penaltyActive} />
        </div>
      </div>
      <span className={cn(
        'text-[10px] tracking-wide uppercase',
        penaltyActive ? 'text-red-400/70' : 'text-white/40'
      )}>
        {label}
      </span>
    </div>
  )
}

// ────────────────────────────────────
// ANIMATED NUMBER
// ────────────────────────────────────

function AnimatedNumber({ value, penaltyActive }: { value: number; penaltyActive?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1,
      ease: 'easeOut',
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent = Math.round(latest).toString()
        }
      },
    })
    return controls.stop
  }, [value, motionValue])

  return (
    <span
      ref={ref}
      className={cn(
        'text-xs font-mono tabular-nums',
        penaltyActive ? 'text-red-400/90' : 'text-white/80'
      )}
    >
      0
    </span>
  )
}

// ────────────────────────────────────
// LINEAR BAR — Compact metric for map view
// ────────────────────────────────────

interface MetricBarProps {
  value: number
  label: string
  penaltyActive?: boolean
}

function MetricBar({ value, label, penaltyActive }: MetricBarProps) {
  const getColor = (v: number) => {
    if (penaltyActive) return 'bg-red-400/80'
    if (v >= 80) return 'bg-emerald-400/80'
    if (v >= 60) return 'bg-amber-400/80'
    if (v >= 40) return 'bg-orange-400/80'
    return 'bg-red-400/80'
  }

  return (
    <div className="flex items-center gap-2">
      <span className={cn(
        'text-[10px] tracking-wide uppercase w-16 shrink-0',
        penaltyActive ? 'text-red-400/60' : 'text-white/40'
      )}>
        {label}
      </span>
      <div className="flex-1 h-1 bg-white/[0.08] rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', getColor(value))}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className={cn(
        'text-[10px] font-mono tabular-nums w-6 text-right',
        penaltyActive ? 'text-red-400/70' : 'text-white/50'
      )}>
        {value}
      </span>
    </div>
  )
}

// ────────────────────────────────────
// TRUST SNAPSHOT — Worker
// ────────────────────────────────────

interface WorkerTrustSnapshotProps {
  reliability: number
  latency: number
  silenceRatio: number
  penaltyActive?: boolean
  compact?: boolean  // map mode
}

export function WorkerTrustSnapshot({
  reliability,
  latency,
  silenceRatio,
  penaltyActive,
  compact,
}: WorkerTrustSnapshotProps) {
  if (compact) {
    return (
      <div className="space-y-1.5">
        <MetricBar value={reliability} label="Reliab." penaltyActive={penaltyActive} />
        <MetricBar value={latency} label="Latency" penaltyActive={penaltyActive} />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-2">
      <MetricRing
        value={reliability}
        label="Reliab."
        penaltyActive={penaltyActive}
      />
      <MetricRing
        value={latency}
        label="Latency"
        penaltyActive={penaltyActive}
      />
      <MetricRing
        value={100 - silenceRatio}
        label="Presence"
        penaltyActive={penaltyActive}
      />
    </div>
  )
}

// ────────────────────────────────────
// TRUST SNAPSHOT — Employer
// ────────────────────────────────────

interface EmployerTrustSnapshotProps {
  paymentReliability: number
  disputeRatio: number
  responseTime: number
  penaltyActive?: boolean
  compact?: boolean
}

export function EmployerTrustSnapshot({
  paymentReliability,
  disputeRatio,
  responseTime,
  penaltyActive,
  compact,
}: EmployerTrustSnapshotProps) {
  if (compact) {
    return (
      <div className="space-y-1.5">
        <MetricBar value={paymentReliability} label="Payment" penaltyActive={penaltyActive} />
        <MetricBar value={100 - disputeRatio} label="Clean" penaltyActive={penaltyActive} />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-2">
      <MetricRing
        value={paymentReliability}
        label="Payment"
        penaltyActive={penaltyActive}
      />
      <MetricRing
        value={100 - disputeRatio}
        label="Clean"
        penaltyActive={penaltyActive}
      />
      <MetricRing
        value={responseTime}
        label="Response"
        penaltyActive={penaltyActive}
      />
    </div>
  )
}
