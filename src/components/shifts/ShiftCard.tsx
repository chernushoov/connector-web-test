'use client'

import { cn, formatRate } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  MapPin,
  Clock,
  Zap,
  AlertTriangle,
  Users,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { ShiftUrgency } from '@/types'

// ============================================
// SHIFT CARD PROPS
// ============================================

export interface ShiftCardData {
  id: string
  title: string
  employerName: string
  cityCode: string
  startTime: string
  endTime: string
  baseRate: number
  surgeMultiplier: number
  isInstant: boolean
  urgency: ShiftUrgency
  slots: number
  filled: number
}

export interface ShiftCardProps {
  shift: ShiftCardData
  onClick?: () => void
  className?: string
}

// ============================================
// SHIFT CARD COMPONENT
// ============================================

export function ShiftCard({ shift, onClick, className }: ShiftCardProps) {
  const effectiveRate = shift.baseRate * shift.surgeMultiplier
  const hasSurge = shift.surgeMultiplier > 1
  const remaining = shift.slots - shift.filled
  const isAlmostFull = remaining <= 2 && remaining > 0

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl p-4 shadow-card cursor-pointer',
        'transition-all duration-200 hover:shadow-card-hover',
        shift.urgency === 'instant' && 'ring-2 ring-danger ring-offset-2',
        className
      )}
    >
      {/* Badges Row */}
      <div className="flex items-center gap-2 mb-2">
        {shift.isInstant && (
          <Badge variant="instant" size="sm" pulse>
            <Zap className="w-3 h-3" />
            Instant
          </Badge>
        )}
        {shift.urgency === 'instant' && !shift.isInstant && (
          <Badge variant="urgent" size="sm">
            <AlertTriangle className="w-3 h-3" />
            Urgent
          </Badge>
        )}
        {shift.urgency === 'today' && (
          <Badge variant="warning" size="sm">
            Today
          </Badge>
        )}
        {hasSurge && (
          <Badge variant="accent" size="sm">
            <TrendingUp className="w-3 h-3" />
            x{shift.surgeMultiplier.toFixed(1)}
          </Badge>
        )}
      </div>

      {/* Title & Employer */}
      <h3 className="font-semibold text-neutral-900 line-clamp-1">
        {shift.title}
      </h3>
      <p className="text-sm text-neutral-500 mt-0.5">{shift.employerName}</p>

      {/* Location & Time */}
      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {shift.cityCode}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {shift.startTime} - {shift.endTime}
        </span>
      </div>

      {/* Rate & Slots */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
        {/* Rate */}
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-success">
            {formatRate(effectiveRate)}
          </span>
          {hasSurge && (
            <span className="text-xs text-neutral-400 line-through">
              {formatRate(shift.baseRate)}
            </span>
          )}
        </div>

        {/* Slots */}
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-neutral-400" />
          <span
            className={cn(
              'text-sm font-medium',
              isAlmostFull ? 'text-danger' : 'text-neutral-600'
            )}
          >
            {shift.filled}/{shift.slots}
          </span>
          {isAlmostFull && (
            <span className="text-xs text-danger font-semibold animate-pulse">
              Almost full!
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ShiftCard
