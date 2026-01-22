'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'

type LoadingSize = 'sm' | 'md' | 'lg' | 'xl'
type LoadingVariant = 'spinner' | 'dots' | 'skeleton' | 'pulse'

interface LoadingStateProps {
  size?: LoadingSize
  variant?: LoadingVariant
  text?: string
  textKey?: string
  fullScreen?: boolean
  className?: string
}

const spinnerSizes: Record<LoadingSize, string> = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
  xl: 'w-16 h-16 border-4',
}

export function LoadingState({
  size = 'md',
  variant = 'spinner',
  text,
  textKey,
  fullScreen = false,
  className,
}: LoadingStateProps) {
  const { language } = useUI()

  const displayText = text || textKey
    ? (textKey ? t(textKey as any, language) : text)
    : t('common.loading', language)

  const containerClasses = cn(
    'flex flex-col items-center justify-center gap-3',
    fullScreen && 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50',
    !fullScreen && 'py-8',
    className
  )

  if (variant === 'spinner') {
    return (
      <div className={containerClasses}>
        <motion.div
          className={cn(
            'rounded-full border-brand-primary border-t-transparent',
            spinnerSizes[size]
          )}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        {displayText && (
          <p className="text-sm text-neutral-500">{displayText}</p>
        )}
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={containerClasses}>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={cn(
                'rounded-full bg-brand-primary',
                size === 'sm' && 'w-2 h-2',
                size === 'md' && 'w-3 h-3',
                size === 'lg' && 'w-4 h-4',
                size === 'xl' && 'w-5 h-5'
              )}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
        {displayText && (
          <p className="text-sm text-neutral-500">{displayText}</p>
        )}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={containerClasses}>
        <motion.div
          className={cn(
            'rounded-full bg-brand-primary/20',
            spinnerSizes[size]
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        />
        {displayText && (
          <p className="text-sm text-neutral-500">{displayText}</p>
        )}
      </div>
    )
  }

  // Skeleton variant
  return (
    <div className={cn('space-y-3', className)}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )
}

// Skeleton components for various use cases
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl p-4 shadow-card', className)}>
      <div className="animate-shimmer">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-neutral-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-neutral-200 rounded w-3/4" />
            <div className="h-3 bg-neutral-200 rounded w-1/2" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 bg-neutral-200 rounded w-full" />
          <div className="h-3 bg-neutral-200 rounded w-5/6" />
        </div>
        <div className="mt-4 flex gap-2">
          <div className="h-8 bg-neutral-200 rounded-lg flex-1" />
          <div className="h-8 bg-neutral-200 rounded-lg w-20" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonLine({
  width = 'full',
  height = 'md',
  className
}: {
  width?: 'full' | '3/4' | '1/2' | '1/4'
  height?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const widthClasses = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/4': 'w-1/4',
  }

  const heightClasses = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-5',
  }

  return (
    <div
      className={cn(
        'animate-shimmer bg-neutral-200 rounded',
        widthClasses[width],
        heightClasses[height],
        className
      )}
    />
  )
}

export function SkeletonAvatar({
  size = 'md',
  className
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  return (
    <div
      className={cn(
        'animate-shimmer bg-neutral-200 rounded-full',
        sizeClasses[size],
        className
      )}
    />
  )
}

export default LoadingState
