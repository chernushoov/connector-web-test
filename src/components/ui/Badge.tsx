'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

// ============================================
// BADGE VARIANTS
// ============================================

const variants = {
  primary: 'bg-brand-primary/10 text-brand-primary',
  accent: 'bg-brand-accent/20 text-neutral-900',
  success: 'bg-success-light text-success-dark',
  warning: 'bg-warning-light text-warning-dark',
  danger: 'bg-danger-light text-danger-dark',
  neutral: 'bg-neutral-100 text-neutral-600',
  // Special variants
  urgent: 'bg-danger text-white animate-pulse-fast',
  pro: 'bg-gradient-accent text-neutral-900 font-bold',
  verified: 'bg-success text-white',
  instant: 'bg-brand-primary text-white',
}

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
}

// ============================================
// BADGE PROPS
// ============================================

export interface BadgeProps {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
  // Animation
  pulse?: boolean
  glow?: boolean
}

// ============================================
// BADGE COMPONENT
// ============================================

export function Badge({
  variant = 'neutral',
  size = 'md',
  icon,
  children,
  className,
  pulse = false,
  glow = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        variants[variant],
        sizes[size],
        pulse && 'animate-pulse',
        glow && 'glow-attention',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  )
}

// ============================================
// URGENCY BADGE
// ============================================

export interface UrgencyBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical'
  children: React.ReactNode
  className?: string
}

export function UrgencyBadge({ level, children, className }: UrgencyBadgeProps) {
  const levelStyles = {
    low: 'bg-neutral-100 text-neutral-600',
    medium: 'bg-warning-light text-warning-dark',
    high: 'bg-danger-light text-danger-dark',
    critical: 'bg-danger text-white animate-pulse-fast',
  }

  return (
    <Badge className={cn(levelStyles[level], className)} size="sm">
      {level === 'critical' && (
        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
      )}
      {children}
    </Badge>
  )
}

// ============================================
// COUNTDOWN BADGE
// ============================================

export interface CountdownBadgeProps {
  endTime: Date
  className?: string
}

export function CountdownBadge({ endTime, className }: CountdownBadgeProps) {
  const now = new Date()
  const diff = endTime.getTime() - now.getTime()

  if (diff <= 0) {
    return <Badge variant="danger" className={className}>Expired</Badge>
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  const isUrgent = hours < 2

  return (
    <Badge
      variant={isUrgent ? 'urgent' : 'warning'}
      className={className}
      icon={
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
    >
      {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
    </Badge>
  )
}

// ============================================
// SLOTS BADGE (Scarcity)
// ============================================

export interface SlotsBadgeProps {
  total: number
  filled: number
  className?: string
}

export function SlotsBadge({ total, filled, className }: SlotsBadgeProps) {
  const remaining = total - filled
  const percentage = (remaining / total) * 100

  let variant: keyof typeof variants = 'neutral'
  let pulse = false

  if (remaining <= 1) {
    variant = 'urgent'
    pulse = true
  } else if (percentage <= 25) {
    variant = 'danger'
  } else if (percentage <= 50) {
    variant = 'warning'
  }

  return (
    <Badge variant={variant} pulse={pulse} className={className}>
      {remaining}/{total} spots
    </Badge>
  )
}

// ============================================
// RATING BADGE
// ============================================

export interface RatingBadgeProps {
  rating: number
  reviewCount?: number
  className?: string
}

export function RatingBadge({ rating, reviewCount, className }: RatingBadgeProps) {
  let variant: keyof typeof variants = 'neutral'

  if (rating >= 4.5) variant = 'success'
  else if (rating >= 4.0) variant = 'primary'
  else if (rating >= 3.5) variant = 'warning'
  else if (rating > 0) variant = 'danger'

  return (
    <Badge
      variant={variant}
      className={className}
      icon={
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      }
    >
      {rating.toFixed(1)}
      {reviewCount !== undefined && (
        <span className="opacity-75 ml-0.5">({reviewCount})</span>
      )}
    </Badge>
  )
}

// ============================================
// VERIFIED BADGE
// ============================================

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <Badge variant="verified" size="sm" className={className}>
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    </Badge>
  )
}

// ============================================
// PRO BADGE
// ============================================

export function ProBadge({ className }: { className?: string }) {
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
        'bg-gradient-accent text-neutral-900 text-xs font-bold',
        'shadow-sm',
        className
      )}
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      PRO
    </motion.span>
  )
}

// ============================================
// INSTANT BADGE
// ============================================

export function InstantBadge({ className }: { className?: string }) {
  return (
    <Badge variant="instant" size="sm" className={className} pulse>
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
          clipRule="evenodd"
        />
      </svg>
      Instant
    </Badge>
  )
}
