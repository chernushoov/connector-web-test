'use client'

import { cn, formatMoney, formatDate, formatDistance } from '@/lib/utils'
import { motion } from 'framer-motion'
import type { ShiftPosting, Language } from '@/types'
import {
  Card,
  Avatar,
  Badge,
  RatingBadge,
  VerifiedBadge,
  InstantBadge,
  SlotsBadge,
} from '@/components/ui'
import { Button, CTAButton } from '@/components/ui/Button'

// ============================================
// SHIFT CARD PROPS
// ============================================

export interface ShiftCardProps {
  shift: ShiftPosting
  lang?: Language
  distance?: number
  matchPercent?: number
  onClick?: () => void
  onApply?: () => void
  // Display options
  variant?: 'default' | 'compact' | 'detailed' | 'featured'
  showEmployer?: boolean
  showApplyButton?: boolean
  // Psychology indicators
  isRecommended?: boolean
  className?: string
}

// ============================================
// SHIFT CARD COMPONENT
// ============================================

export function ShiftCard({
  shift,
  lang = 'ru',
  distance,
  matchPercent,
  onClick,
  onApply,
  variant = 'default',
  showEmployer = true,
  showApplyButton = true,
  isRecommended = false,
  className,
}: ShiftCardProps) {
  const isUrgent = shift.urgency === 'instant' || shift.isInstant
  const hasScarcity = shift.slots - shift.filled <= 3
  const hasCompetition = shift.applicants > 0
  const effectiveRate = shift.baseRate * shift.surgeMultiplier

  if (variant === 'compact') {
    return (
      <CompactShiftCard
        shift={shift}
        distance={distance}
        onClick={onClick}
        isUrgent={isUrgent}
        className={className}
      />
    )
  }

  if (variant === 'featured') {
    return (
      <FeaturedShiftCard
        shift={shift}
        distance={distance}
        onApply={onApply}
        matchPercent={matchPercent}
        className={className}
      />
    )
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl p-4 shadow-card cursor-pointer',
        'transition-all duration-200 hover:shadow-card-hover',
        'relative overflow-hidden',
        isUrgent && 'ring-2 ring-danger ring-offset-2',
        isRecommended && 'ring-2 ring-brand-primary ring-offset-2',
        className
      )}
    >
      {/* Urgent ribbon */}
      {isUrgent && (
        <div className="absolute top-3 -right-8 rotate-45 bg-danger text-white text-xs font-bold px-8 py-1 z-10">
          URGENT
        </div>
      )}

      {/* Match percent badge */}
      {matchPercent !== undefined && matchPercent >= 80 && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="success" size="sm">
            {matchPercent}% match
          </Badge>
        </div>
      )}

      {/* Header badges */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {isUrgent && <InstantBadge />}
        {shift.surgeMultiplier > 1 && (
          <Badge variant="accent" size="sm">
            🔥 {shift.surgeMultiplier}x rate
          </Badge>
        )}
        {shift.hasEscrow && (
          <Badge variant="success" size="sm">
            💰 Escrow
          </Badge>
        )}
        {shift.paymentGuarantee && (
          <Badge variant="primary" size="sm">
            ✓ Guaranteed
          </Badge>
        )}
      </div>

      {/* Title & Description */}
      <h3 className="font-semibold text-lg text-neutral-900 line-clamp-2">
        {shift.title}
      </h3>
      {shift.description && (
        <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
          {shift.description}
        </p>
      )}

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-neutral-500">
        {/* Date & Time */}
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(shift.date, lang)}
        </span>

        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {shift.startTime} - {shift.endTime}
        </span>

        {/* Distance */}
        {distance && (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {formatDistance(distance)}
          </span>
        )}

        {/* City */}
        <span>{shift.city}</span>
      </div>

      {/* Rate & Total */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
        <div>
          <p className="text-sm text-neutral-500">Rate</p>
          <p className="text-xl font-bold text-success">
            {formatMoney(effectiveRate)}/h
            {shift.surgeMultiplier > 1 && (
              <span className="text-sm line-through text-neutral-400 ml-1">
                {formatMoney(shift.baseRate)}
              </span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-neutral-500">Total estimate</p>
          <p className="text-xl font-bold text-neutral-900">
            {formatMoney(shift.totalEstimate)}
          </p>
        </div>
      </div>

      {/* Employer */}
      {showEmployer && shift.employer && (
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-neutral-100">
          <Avatar
            name={shift.employer.company || shift.employer.name}
            size="sm"
            isVerified={shift.employer.isVerified}
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-neutral-900 truncate">
              {shift.employer.company || shift.employer.name}
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              {shift.employer.rating > 0 && (
                <span className="flex items-center gap-0.5">
                  <svg className="w-3 h-3 text-warning" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {shift.employer.rating.toFixed(1)}
                </span>
              )}
              {shift.employer.totalPaid > 10000 && (
                <span className="text-success">
                  ₪{(shift.employer.totalPaid / 1000).toFixed(0)}k+ paid
                </span>
              )}
            </div>
          </div>
          {shift.employer.isVerified && <VerifiedBadge />}
        </div>
      )}

      {/* Psychology footer */}
      <div className="flex items-center gap-3 mt-3 text-xs">
        {/* Scarcity */}
        {hasScarcity && (
          <SlotsBadge total={shift.slots} filled={shift.filled} />
        )}

        {/* Competition */}
        {hasCompetition && (
          <span className="text-neutral-500">
            {shift.applicants} applied
          </span>
        )}

        {/* Views */}
        {shift.viewCount > 10 && (
          <span className="text-neutral-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
            {shift.viewCount} viewing
          </span>
        )}
      </div>

      {/* Apply button */}
      {showApplyButton && onApply && (
        <div className="mt-4">
          <CTAButton
            onClick={(e) => {
              e.stopPropagation()
              onApply()
            }}
            earnings={shift.totalEstimate}
            spotsLeft={shift.slots - shift.filled}
            urgencyText={isUrgent ? 'Starts soon!' : undefined}
          >
            Apply Now
          </CTAButton>
        </div>
      )}
    </motion.div>
  )
}

// ============================================
// COMPACT SHIFT CARD
// ============================================

function CompactShiftCard({
  shift,
  distance,
  onClick,
  isUrgent,
  className,
}: {
  shift: ShiftPosting
  distance?: number
  onClick?: () => void
  isUrgent?: boolean
  className?: string
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer',
        'hover:bg-neutral-50 transition-colors',
        isUrgent && 'bg-danger-light',
        className
      )}
    >
      {/* Time badge */}
      <div
        className={cn(
          'w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0',
          isUrgent ? 'bg-danger text-white' : 'bg-brand-primary/10 text-brand-primary'
        )}
      >
        <span className="text-xs font-medium">
          {new Date(shift.date).toLocaleDateString('en', { weekday: 'short' })}
        </span>
        <span className="text-lg font-bold">{shift.startTime.split(':')[0]}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-neutral-900 truncate">{shift.title}</p>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>{shift.startTime} - {shift.endTime}</span>
          {distance && <span>{formatDistance(distance)}</span>}
        </div>
      </div>

      {/* Rate */}
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-success">
          {formatMoney(shift.baseRate * shift.surgeMultiplier)}/h
        </p>
        <p className="text-xs text-neutral-500">
          ~{formatMoney(shift.totalEstimate)}
        </p>
      </div>

      <svg
        className="w-5 h-5 text-neutral-400 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </motion.div>
  )
}

// ============================================
// FEATURED SHIFT CARD
// ============================================

function FeaturedShiftCard({
  shift,
  distance,
  onApply,
  matchPercent,
  className,
}: {
  shift: ShiftPosting
  distance?: number
  onApply?: () => void
  matchPercent?: number
  className?: string
}) {
  const isUrgent = shift.urgency === 'instant' || shift.isInstant
  const effectiveRate = shift.baseRate * shift.surgeMultiplier

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-5',
        'bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white',
        'shadow-lg',
        className
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Match badge */}
        {matchPercent !== undefined && (
          <div className="inline-flex items-center gap-1 bg-white/20 text-white px-2 py-1 rounded-full text-xs font-bold mb-3">
            ✨ {matchPercent}% match for you
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold">{shift.title}</h3>

        {/* Employer */}
        <p className="text-white/80 mt-1">{shift.employer.company}</p>

        {/* Rate - big and bold */}
        <div className="mt-4">
          <p className="text-sm text-white/70">Earn up to</p>
          <p className="text-3xl font-bold">
            {formatMoney(shift.totalEstimate)}
          </p>
          <p className="text-sm text-white/70">
            at {formatMoney(effectiveRate)}/hour
          </p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-3 text-sm text-white/80">
          <span>
            {new Date(shift.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <span>{shift.startTime} - {shift.endTime}</span>
          {distance && <span>{formatDistance(distance)}</span>}
        </div>

        {/* CTA */}
        {onApply && (
          <Button
            variant="accent"
            fullWidth
            size="lg"
            className="mt-4"
            onClick={(e) => {
              e.stopPropagation()
              onApply()
            }}
          >
            Apply & Earn {formatMoney(shift.totalEstimate)}
          </Button>
        )}
      </div>
    </motion.div>
  )
}

// ============================================
// SHIFT LIST
// ============================================

export interface ShiftListProps {
  shifts: ShiftPosting[]
  title?: string
  emptyMessage?: string
  variant?: 'default' | 'compact'
  onShiftClick?: (shift: ShiftPosting) => void
  onApply?: (shift: ShiftPosting) => void
  className?: string
}

export function ShiftList({
  shifts,
  title,
  emptyMessage = 'No shifts available',
  variant = 'default',
  onShiftClick,
  onApply,
  className,
}: ShiftListProps) {
  if (shifts.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <svg
          className="w-12 h-12 text-neutral-300 mx-auto mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-neutral-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {title && (
        <h2 className="text-lg font-semibold text-neutral-900 mb-3">{title}</h2>
      )}
      <div className={cn('flex flex-col', variant === 'default' ? 'gap-4' : 'gap-1')}>
        {shifts.map((shift) => (
          <ShiftCard
            key={shift.id}
            shift={shift}
            variant={variant}
            onClick={() => onShiftClick?.(shift)}
            onApply={() => onApply?.(shift)}
            showApplyButton={variant === 'default'}
          />
        ))}
      </div>
    </div>
  )
}
