'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/shared'
import { Star, ThumbsUp, Briefcase } from 'lucide-react'
import type { Review } from '@/types'

interface ReviewListProps {
  reviews: Review[]
  showShiftInfo?: boolean
  className?: string
}

export function ReviewList({
  reviews,
  showShiftInfo = true,
  className
}: ReviewListProps) {
  const { language, isRTL } = useUI()

  if (reviews.length === 0) {
    return (
      <EmptyState
        type="no-results"
        title="No reviews yet"
        subtitle="Reviews will appear here after completing shifts"
        className={className}
      />
    )
  }

  return (
    <div className={cn('space-y-4', className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {reviews.map((review, index) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ReviewCard review={review} showShiftInfo={showShiftInfo} />
        </motion.div>
      ))}
    </div>
  )
}

function ReviewCard({
  review,
  showShiftInfo
}: {
  review: Review
  showShiftInfo: boolean
}) {
  const { language, isRTL } = useUI()

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const days = Math.floor(diff / 86400000)

    if (days === 0) return t('time.today', language as any)
    if (days === 1) return t('time.tomorrow', language as any)
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <Card>
      <div className="flex items-start gap-3">
        <Avatar
          size="md"
          name={review.authorName}
          src={review.authorPhotoUrl}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">{review.authorName}</p>
              <p className="text-xs text-neutral-500">
                {review.isFromEmployer ? 'Employer' : 'Worker'}
              </p>
            </div>
            <span className="text-xs text-neutral-400">
              {formatDate(review.createdAt)}
            </span>
          </div>

          {/* Rating stars */}
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'w-4 h-4',
                  star <= review.rating
                    ? 'text-brand-accent fill-brand-accent'
                    : 'text-neutral-200'
                )}
              />
            ))}
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-sm text-neutral-600 mt-2">
              {review.comment}
            </p>
          )}

          {/* Shift info */}
          {showShiftInfo && review.shiftTitle && (
            <div className="flex items-center gap-2 mt-3 text-xs text-neutral-500">
              <Briefcase className="w-3 h-3" />
              <span>{review.shiftTitle}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// Average rating display
export function RatingOverview({
  rating,
  reviewCount,
  distribution
}: {
  rating: number
  reviewCount: number
  distribution?: Record<number, number>
}) {
  const { language } = useUI()

  const defaultDistribution = distribution || {
    5: 65,
    4: 20,
    3: 10,
    2: 3,
    1: 2,
  }

  return (
    <Card className="flex items-center gap-6">
      {/* Overall rating */}
      <div className="text-center">
        <p className="text-4xl font-bold text-neutral-900">{rating.toFixed(1)}</p>
        <div className="flex justify-center mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                'w-4 h-4',
                star <= Math.round(rating)
                  ? 'text-brand-accent fill-brand-accent'
                  : 'text-neutral-200'
              )}
            />
          ))}
        </div>
        <p className="text-sm text-neutral-500 mt-1">
          {reviewCount} {t('worker.reviews', language as any)}
        </p>
      </div>

      {/* Distribution bars */}
      <div className="flex-1 space-y-1">
        {[5, 4, 3, 2, 1].map((stars) => {
          const percent = defaultDistribution[stars] || 0
          return (
            <div key={stars} className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 w-3">{stars}</span>
              <Star className="w-3 h-3 text-brand-accent fill-brand-accent" />
              <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-brand-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ delay: (5 - stars) * 0.1 }}
                />
              </div>
              <span className="text-xs text-neutral-400 w-8">{percent}%</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default ReviewList
