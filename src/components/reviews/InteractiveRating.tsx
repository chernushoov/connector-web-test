'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

// ============================================
// INTERACTIVE RATING PROPS
// ============================================

export interface InteractiveRatingProps {
  value: number
  onChange: (rating: number) => void
  size?: 'md' | 'lg'
  className?: string
}

// ============================================
// SIZE CONFIG
// ============================================

const SIZE_CLASSES = {
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
}

// ============================================
// INTERACTIVE RATING COMPONENT
// ============================================

export function InteractiveRating({
  value,
  onChange,
  size = 'lg',
  className,
}: InteractiveRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)
  const displayValue = hoverValue || value

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      onMouseLeave={() => setHoverValue(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= displayValue

        return (
          <motion.button
            key={star}
            type="button"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHoverValue(star)}
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={cn(
                SIZE_CLASSES[size],
                'transition-colors duration-150 cursor-pointer',
                isActive
                  ? 'text-brand-accent fill-brand-accent'
                  : 'text-neutral-200 hover:text-neutral-300'
              )}
            />
          </motion.button>
        )
      })}
    </div>
  )
}

export default InteractiveRating
