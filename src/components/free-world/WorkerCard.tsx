'use client'

import { cn, formatDistance, formatRate } from '@/lib/utils'
import { motion } from 'framer-motion'
import type { QuickProfile, Language } from '@/types'
import { Avatar, RatingBadge, VerifiedBadge, ProBadge, Badge } from '@/components/ui'
import { Button } from '@/components/ui/Button'

// ============================================
// WORKER CARD PROPS
// ============================================

export interface WorkerCardProps {
  worker: QuickProfile
  lang?: Language
  distance?: number
  onClick?: () => void
  onContact?: () => void
  onWhatsApp?: () => void
  // Display options
  variant?: 'default' | 'compact' | 'detailed'
  showDistance?: boolean
  showActions?: boolean
  // Psychology
  isNew?: boolean
  isHighDemand?: boolean
  className?: string
}

// ============================================
// WORKER CARD COMPONENT
// ============================================

export function WorkerCard({
  worker,
  lang = 'ru',
  distance,
  onClick,
  onContact,
  onWhatsApp,
  variant = 'default',
  showDistance = true,
  showActions = true,
  isNew = false,
  isHighDemand = false,
  className,
}: WorkerCardProps) {
  const isAvailable = worker.availabilityStatus === 'available'

  if (variant === 'compact') {
    return (
      <CompactWorkerCard
        worker={worker}
        distance={distance}
        onClick={onClick}
        isAvailable={isAvailable}
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
        isAvailable && 'ring-2 ring-success ring-offset-2',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar
            src={worker.photoUrl}
            name={worker.name}
            size="lg"
            isAvailable={isAvailable}
            isPro={(worker as any).isPro ?? false}
            isVerified={worker.isVerified}
          />
          {isAvailable && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-white animate-pulse" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-neutral-900 truncate">
              {worker.name}
            </h3>
            {worker.isVerified && <VerifiedBadge />}
            {(worker as any).isPro && <ProBadge />}
          </div>

          {/* Rating & reviews */}
          <div className="flex items-center gap-2 mt-1">
            {worker.rating > 0 && (
              <RatingBadge rating={worker.rating} reviewCount={worker.reviewCount} />
            )}
            {showDistance && distance && (
              <span className="text-xs text-neutral-500">
                {formatDistance(distance)}
              </span>
            )}
          </div>

          {/* Skills */}
          {worker.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {worker.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="neutral" size="sm">
                  {skill}
                </Badge>
              ))}
              {worker.skills.length > 3 && (
                <Badge variant="neutral" size="sm">
                  +{worker.skills.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Rate */}
        {worker.hourlyRate && (
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-success">
              {formatRate(worker.hourlyRate)}
            </p>
          </div>
        )}
      </div>

      {/* Psychology indicators */}
      {(isNew || isHighDemand || isAvailable) && (
        <div className="flex items-center gap-2 mt-3">
          {isAvailable && (
            <Badge variant="success" size="sm">
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
              Available now
            </Badge>
          )}
          {isNew && (
            <Badge variant="accent" size="sm">
              New
            </Badge>
          )}
          {isHighDemand && (
            <Badge variant="warning" size="sm">
              High demand
            </Badge>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 mt-4">
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={(e) => {
              e.stopPropagation()
              onContact?.()
            }}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          >
            Contact
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onWhatsApp?.()
            }}
            leftIcon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            }
          >
            WhatsApp
          </Button>
        </div>
      )}
    </motion.div>
  )
}

// ============================================
// COMPACT WORKER CARD
// ============================================

function CompactWorkerCard({
  worker,
  distance,
  onClick,
  isAvailable,
  className,
}: {
  worker: QuickProfile
  distance?: number
  onClick?: () => void
  isAvailable?: boolean
  className?: string
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer',
        'hover:bg-neutral-50 transition-colors',
        className
      )}
    >
      <Avatar
        src={worker.photoUrl}
        name={worker.name}
        size="md"
        isAvailable={isAvailable}
      />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-neutral-900 truncate">{worker.name}</p>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          {worker.rating > 0 && (
            <span className="flex items-center gap-0.5">
              <svg className="w-3 h-3 text-warning" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {worker.rating.toFixed(1)}
            </span>
          )}
          {distance && <span>{formatDistance(distance)}</span>}
        </div>
      </div>

      {worker.hourlyRate && (
        <p className="font-semibold text-success text-sm">
          ₪{worker.hourlyRate}/h
        </p>
      )}

      <svg
        className="w-5 h-5 text-neutral-400"
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
// WORKER LIST
// ============================================

export interface WorkerListProps {
  workers: QuickProfile[]
  title?: string
  emptyMessage?: string
  variant?: 'default' | 'compact'
  onWorkerClick?: (worker: QuickProfile) => void
  className?: string
}

export function WorkerList({
  workers,
  title,
  emptyMessage = 'No workers found nearby',
  variant = 'default',
  onWorkerClick,
  className,
}: WorkerListProps) {
  if (workers.length === 0) {
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
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
      <div className={cn('flex flex-col', variant === 'default' ? 'gap-3' : 'gap-1')}>
        {workers.map((worker) => (
          <WorkerCard
            key={worker.id}
            worker={worker}
            variant={variant}
            onClick={() => onWorkerClick?.(worker)}
            showActions={variant === 'default'}
          />
        ))}
      </div>
    </div>
  )
}
