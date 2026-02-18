'use client'

import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

// ============================================
// RATING STARS PROPS
// ============================================

export interface RatingStarsProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// ============================================
// SIZE CONFIG
// ============================================

const SIZE_CLASSES = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4.5 h-4.5',
  lg: 'w-6 h-6',
}

const GAP_CLASSES = {
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1',
}

// ============================================
// RATING STARS COMPONENT
// ============================================

export function RatingStars({ rating, size = 'md', className }: RatingStarsProps) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0)

  return (
    <div className={cn('flex items-center', GAP_CLASSES[size], className)}>
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className={cn(SIZE_CLASSES[size], 'text-brand-accent fill-brand-accent')}
        />
      ))}

      {/* Half star */}
      {hasHalf && (
        <div className="relative">
          <Star
            className={cn(SIZE_CLASSES[size], 'text-neutral-200')}
          />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star
              className={cn(SIZE_CLASSES[size], 'text-brand-accent fill-brand-accent')}
            />
          </div>
        </div>
      )}

      {/* Empty stars */}
      {Array.from({ length: Math.max(0, emptyStars) }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className={cn(SIZE_CLASSES[size], 'text-neutral-200')}
        />
      ))}
    </div>
  )
}

export default RatingStars
