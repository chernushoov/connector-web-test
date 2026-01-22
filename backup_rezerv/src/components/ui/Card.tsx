'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { motion, type HTMLMotionProps } from 'framer-motion'

// ============================================
// CARD VARIANTS
// ============================================

const variants = {
  default: 'bg-white shadow-card',
  elevated: 'bg-white shadow-elevated',
  outlined: 'bg-white border border-neutral-200',
  filled: 'bg-neutral-50',
  gradient: 'bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white',
  accent: 'bg-gradient-to-br from-brand-accent to-brand-accent-dark',
}

// ============================================
// CARD PROPS
// ============================================

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants
  padding?: 'none' | 'sm' | 'md' | 'lg'
  radius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  interactive?: boolean
  // Psychology: highlight important cards
  highlight?: boolean
  glow?: boolean
}

// ============================================
// CARD COMPONENT
// ============================================

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      radius = '2xl',
      interactive = false,
      highlight = false,
      glow = false,
      children,
      ...props
    },
    ref
  ) => {
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
    }

    const radiusClasses = {
      sm: 'rounded-lg',
      md: 'rounded-xl',
      lg: 'rounded-2xl',
      xl: 'rounded-3xl',
      '2xl': 'rounded-[1.25rem]',
    }

    const baseClasses = cn(
      'transition-all duration-200',
      variants[variant],
      paddingClasses[padding],
      radiusClasses[radius],
      interactive && 'cursor-pointer hover:shadow-card-hover',
      highlight && 'ring-2 ring-brand-primary ring-offset-2',
      glow && 'glow-attention',
      className
    )

    if (interactive) {
      return (
        <motion.div
          ref={ref}
          className={baseClasses}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300 }}
          onClick={props.onClick}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref}
        className={baseClasses}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// ============================================
// CARD HEADER
// ============================================

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export function CardHeader({
  title,
  subtitle,
  action,
  children,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)} {...props}>
      <div className="flex-1 min-w-0">
        {title && <h3 className="font-semibold text-neutral-900 truncate">{title}</h3>}
        {subtitle && (
          <p className="text-sm text-neutral-500 mt-0.5 truncate">{subtitle}</p>
        )}
        {children}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

// ============================================
// CARD CONTENT
// ============================================

export function CardContent({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-3', className)} {...props}>
      {children}
    </div>
  )
}

// ============================================
// CARD FOOTER
// ============================================

export function CardFooter({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-4 pt-4 border-t border-neutral-100', className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================
// SHIFT CARD (Psychology-optimized)
// ============================================

export interface ShiftCardProps extends CardProps {
  // Urgency indicators
  isUrgent?: boolean
  isInstant?: boolean
  expiresAt?: Date
  // Scarcity indicators
  slotsTotal?: number
  slotsFilled?: number
  applicants?: number
  // Money highlight
  rate?: number
  totalEstimate?: number
  // Social proof
  viewCount?: number
}

export const ShiftCard = forwardRef<HTMLDivElement, ShiftCardProps>(
  (
    {
      isUrgent,
      isInstant,
      expiresAt,
      slotsTotal,
      slotsFilled,
      applicants,
      rate,
      totalEstimate,
      viewCount,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const hasScarcity =
      slotsTotal && slotsFilled && slotsTotal - slotsFilled <= 3
    const hasCompetition = applicants && applicants > 0

    return (
      <Card
        ref={ref}
        interactive
        highlight={isUrgent || isInstant}
        glow={isUrgent}
        className={cn(
          'relative overflow-hidden',
          isUrgent && 'border-2 border-danger',
          className
        )}
        {...props}
      >
        {/* Urgent ribbon */}
        {isUrgent && (
          <div className="absolute top-3 -right-8 rotate-45 bg-danger text-white text-xs font-bold px-8 py-1">
            URGENT
          </div>
        )}

        {/* Content */}
        {children}

        {/* Psychology footer */}
        {(hasScarcity || hasCompetition || viewCount) && (
          <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center gap-3 text-xs">
            {/* Scarcity */}
            {hasScarcity && (
              <span className="text-danger font-semibold animate-pulse">
                Only {slotsTotal - slotsFilled} spots left!
              </span>
            )}

            {/* Competition */}
            {hasCompetition && (
              <span className="text-neutral-500">
                {applicants} already applied
              </span>
            )}

            {/* Social proof */}
            {viewCount && viewCount > 10 && (
              <span className="text-neutral-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                {viewCount} viewing
              </span>
            )}
          </div>
        )}
      </Card>
    )
  }
)

ShiftCard.displayName = 'ShiftCard'

// ============================================
// STATS CARD
// ============================================

export interface StatsCardProps extends CardProps {
  icon?: React.ReactNode
  label: string
  value: string | number
  change?: number // percentage change
  trend?: 'up' | 'down' | 'neutral'
}

export function StatsCard({
  icon,
  label,
  value,
  change,
  trend = 'neutral',
  className,
  ...props
}: StatsCardProps) {
  const trendColors = {
    up: 'text-success',
    down: 'text-danger',
    neutral: 'text-neutral-500',
  }

  return (
    <Card variant="outlined" className={cn('', className)} {...props}>
      <div className="flex items-start justify-between">
        {icon && (
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            {icon}
          </div>
        )}
        {change !== undefined && (
          <span className={cn('text-sm font-medium', trendColors[trend])}>
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm text-neutral-500">{label}</p>
        <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
      </div>
    </Card>
  )
}
