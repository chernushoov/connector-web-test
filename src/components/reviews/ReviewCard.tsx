'use client'

import { cn, formatRelativeTime } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Briefcase } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { RatingStars } from './RatingStars'

// ============================================
// REVIEW CARD PROPS
// ============================================

export interface ReviewCardData {
  authorName: string
  authorPhoto?: string
  rating: number
  comment: string
  date: Date | string
  shiftTitle?: string
}

export interface ReviewCardProps {
  review: ReviewCardData
  className?: string
}

// ============================================
// REVIEW CARD COMPONENT
// ============================================

export function ReviewCard({ review, className }: ReviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={className}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar
            size="md"
            name={review.authorName}
            src={review.authorPhoto}
          />

          <div className="flex-1 min-w-0">
            {/* Header: name & date */}
            <div className="flex items-center justify-between">
              <p className="font-medium text-neutral-900">{review.authorName}</p>
              <span className="text-xs text-neutral-400">
                {formatRelativeTime(review.date)}
              </span>
            </div>

            {/* Stars */}
            <div className="mt-1">
              <RatingStars rating={review.rating} size="sm" />
            </div>

            {/* Comment */}
            {review.comment && (
              <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                {review.comment}
              </p>
            )}

            {/* Shift info */}
            {review.shiftTitle && (
              <div className="flex items-center gap-1.5 mt-3 text-xs text-neutral-500">
                <Briefcase className="w-3 h-3" />
                <span className="truncate">{review.shiftTitle}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default ReviewCard
